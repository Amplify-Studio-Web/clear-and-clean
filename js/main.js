/* Clear & Clean Window Cleaning — homepage interactions */
(function () {
  "use strict";

  // ---- Year ----
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // ---- Nav: scrolled state + mobile menu ----
  var nav = document.getElementById("nav");
  var burger = document.getElementById("burger");
  var panel = document.getElementById("navPanel");

  function onScroll() {
    if (window.scrollY > 30) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    nav.classList.remove("open");
    document.body.style.overflow = "";
    if (burger) burger.setAttribute("aria-expanded", "false");
  }
  if (burger) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      document.body.style.overflow = open ? "hidden" : "";
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  if (panel) {
    panel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  // ---- Accordions (locations + FAQ): single-open per group ----
  document.querySelectorAll(".acc__head").forEach(function (head) {
    head.addEventListener("click", function () {
      var item = head.closest(".acc__item");
      var group = head.closest(".acc");
      var willOpen = !item.classList.contains("open");
      if (group && willOpen) {
        group.querySelectorAll(".acc__item.open").forEach(function (other) {
          if (other !== item) {
            other.classList.remove("open");
            var oh = other.querySelector(".acc__head");
            if (oh) oh.setAttribute("aria-expanded", "false");
          }
        });
      }
      item.classList.toggle("open", willOpen);
      head.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });
  });

  // ---- Scroll reveal (visible-by-default; hide-then-reveal as enhancement) ----
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  if (!reduce) {
    // Arm: hide everything, then reveal what's in view (animates) and let the
    // rest reveal on scroll. Visible state is the CSS default, so anything that
    // never gets toggled simply stays visible.
    items.forEach(function (el) { el.classList.add("is-pre"); });

    var reveal = function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      items.forEach(function (el) {
        if (!el.classList.contains("is-pre")) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0) el.classList.remove("is-pre");
      });
    };
    reveal();
    window.addEventListener("scroll", reveal, { passive: true });
    window.addEventListener("resize", reveal, { passive: true });

    // Frozen-clock / no-paint safety: anything already in the viewport must be
    // shown even if transitions can't progress. Snap it on instantly.
    setTimeout(function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      items.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0 && el.classList.contains("is-pre")) {
          el.style.transition = "none";
          el.classList.remove("is-pre");
          el.style.opacity = "1";
          el.style.transform = "none";
        }
      });
    }, 1000);
  }
})();
