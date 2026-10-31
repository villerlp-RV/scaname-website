// Small helpers for getting visitors to the app.
// - iPhone/iPad: show the "Scaname is on Android for now" note.
// - Android phones: a "Get Scaname" bar once the top badge scrolls away,
//   hidden again at the closing call to action; it can be closed.
// - Reduced motion: the demo video doesn't autoplay.
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
