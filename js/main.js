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
    if (!nav) return;
    if (window.scrollY > 30) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    if (nav) nav.classList.remove("open");
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

  // ---- Site-wide scroll reveal ----
  // Add reveal behavior to the shared page building blocks so every page has
  // the same motion rhythm without requiring animation markup in every file.
  function addReveal(el, index) {
    if (!el || el.hasAttribute("data-reveal")) return;
    el.setAttribute("data-reveal", "");
    if (index % 4) el.setAttribute("data-d", String(index % 4));
  }

  [
    ".hero__content",
    ".page-hero > .wrap",
    ".sec-head",
    ".proof",
    ".service-pair",
    ".services-grid",
    ".service-overview-grid",
    ".home-review-grid",
    ".business-info-grid",
    ".values",
    ".steps",
    ".plans",
    ".reviews-grid",
    ".svc-related",
    ".svc-faq",
    ".about-grid",
    ".about-duo",
    ".loc__row",
    ".contact-grid",
    ".footer__grid"
  ].forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (group) {
      Array.prototype.forEach.call(group.children, addReveal);
    });
  });

  document.querySelectorAll([
    ".city-map",
    ".about-intro > *",
    ".center-cta",
    ".simple-cta > *",
    ".footer__bottom",
    ".panel.is-active > *"
  ].join(",")).forEach(function (el, index) { addReveal(el, index); });

  // Safety net: every content section receives at least one reveal target,
  // including future pages that use a new component class.
  document.querySelectorAll("section").forEach(function (section) {
    if (section.querySelector("[data-reveal]")) return;
    var container = section.querySelector(":scope > .wrap") || section;
    Array.prototype.forEach.call(container.children, addReveal);
  });

  // Visible-by-default; hide-then-reveal only when motion is allowed.
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  if (!reduce) {
    items.forEach(function (el) { el.classList.add("is-pre"); });

    var revealVisible = function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      items.forEach(function (el) {
        if (!el.classList.contains("is-pre")) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.94 && r.bottom > 0) el.classList.remove("is-pre");
      });
    };

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove("is-pre");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: "0px" });
      items.forEach(function (el) { observer.observe(el); });
    } else {
      window.addEventListener("scroll", revealVisible, { passive: true });
      window.addEventListener("resize", revealVisible, { passive: true });
    }

    // Let the browser paint the starting state before revealing above-the-fold
    // content so the page entrance animates as consistently as later sections.
    requestAnimationFrame(function () {
      requestAnimationFrame(revealVisible);
    });

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
