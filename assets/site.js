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
