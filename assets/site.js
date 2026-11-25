// Small helpers for getting visitors to the app.
// - iPhone/iPad: show the "Scaname is on Android for now" note.
// - Android phones: a "Get Scaname" bar once the top badge scrolls away,
//   hidden again at the closing call to action; it can be closed.
// - Reduced motion: the demo video doesn't autoplay.
// - Home page: Google Play taps are reported to the TikTok Pixel.
(function () {
  var ua = navigator.userAgent || "";
  var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var android = /Android/i.test(ua);

  if (ios) {
    document.querySelectorAll(".ios-note").forEach(function (el) { el.hidden = false; });
  }

  var video = document.querySelector("video.demo");
  if (video && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    video.removeAttribute("autoplay");
    video.pause();
    video.controls = true;
  }

  // TikTok Pixel (home page only): count taps on any Google Play link as a
  // ClickButton event. Does nothing on pages without the pixel.
  if (window.ttq) {
    document.querySelectorAll('a[href*="play.google.com/store/apps"]').forEach(function (a) {
      a.addEventListener("click", function (ev) {
        var href = a.getAttribute("href") || "";
        try {
          var m = /utm_campaign%3D([a-z_]+)/.exec(href);
          window.ttq.track("ClickButton", { content_name: "Get it on Google Play", content_id: m ? m[1] : "play" });
        } catch (e) {}
        // Google Play opens at once on Android, which can cut the event off.
        // For a plain tap, wait a moment so it can be sent, then go.
        if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || a.target === "_blank") return;
        ev.preventDefault();
        setTimeout(function () { window.location.href = href; }, 300);
      });
    });
  }

  var bar = document.querySelector(".get-bar");
  if (!bar || !android || !("IntersectionObserver" in window)) return;
  var closed = false;
  try { closed = sessionStorage.getItem("scaname-bar-closed") === "1"; } catch (e) {}
  if (closed) return;
  var heroCta = document.querySelector(".hero .cta");
  var endCta = document.querySelector(".cta-band");
  var heroVisible = true, endVisible = false;
  var update = function () { bar.hidden = closed || heroVisible || endVisible; };
  new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; update(); }).observe(heroCta);
  if (endCta) new IntersectionObserver(function (e) { endVisible = e[0].isIntersecting; update(); }).observe(endCta);
  bar.querySelector(".get-bar-close").addEventListener("click", function () {
    closed = true;
    try { sessionStorage.setItem("scaname-bar-closed", "1"); } catch (e) {}
    update();
  });
})();

// Email list form (#bonus): joinEmailList on the Scaname backend. Sent as
// text/plain so the browser doesn't need a CORS preflight.
(function () {
  var form = document.getElementById("join-form");
  if (!form) return;
  var FN = "https://scaname.base44.app/api/apps/6a77508bc9065e174b34ba67/functions/joinEmailList";
  var msg = document.getElementById("join-msg");
  var btn = form.querySelector("button");
  var say = function (text, ok) { msg.textContent = text; msg.className = "join-msg " + (ok ? "ok" : "err"); };
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var email = (document.getElementById("join-email").value || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return say("Please enter a valid email address.", false);
    if (!document.getElementById("join-consent").checked) return say("Please tick the box so we can email you.", false);
    var q = new URLSearchParams(location.search);
    var utm = ["utm_source", "utm_medium", "utm_campaign"].map(function (k) { return q.get(k) || ""; }).join("/");
    btn.disabled = true;
    fetch(FN, { method: "POST", headers: { "content-type": "text/plain" }, body: JSON.stringify({
      email: email, consent: true, consent_text: document.getElementById("join-consent-text").textContent,
      utm: utm === "//" ? "" : utm, company: form.elements.company.value
    }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok || !res.j.ok) throw new Error(res.j && res.j.error);
        say("You're on the list! Your 10 bonus scans are waiting: sign up in the app with this email and they're added automatically.", true);
        form.querySelector(".join-row").hidden = true;
        form.querySelector(".join-consent").hidden = true;
        try { if (window.ttq) window.ttq.track("SubmitForm", { content_name: "Email list" }); } catch (e) {}
      })
      .catch(function (e) {
        btn.disabled = false;
        say(e && e.message === "busy" ? "Lots of sign-ups right now. Please try again in a few minutes." : "Something went wrong. Please try again.", false);
      });
  });
})();
