/* Shared site chrome (nav + footer) injected on every page so they stay in sync. */
(function () {
  "use strict";

  var nav =
'<header class="nav" id="nav">' +
'  <nav class="nav__inner" aria-label="Primary">' +
'    <a class="nav__logo" href="/" aria-label="Clear & Clean Window Cleaning home"><img src="images/clear-clean/logo-wordmark.webp" alt="Clear & Clean Window Cleaning" /></a>' +
'    <div class="nav__links">' +
'      <a class="nav__link" href="/about-us">About Us</a>' +
'      <a class="nav__link" href="/reviews">Reviews</a>' +
'    </div>' +
'    <div class="nav__cta">' +
'      <a class="btn btn-orange" href="/contact">Instant Quote</a>' +
'      <a class="btn btn-white" href="tel:+19728905467">Call 972-890-5467</a>' +
'    </div>' +
'    <button class="nav__burger" id="burger" aria-label="Toggle menu" aria-expanded="false"><span></span><span></span><span></span></button>' +
'  </nav>' +
'  <div class="nav__panel" id="navPanel">' +
'      <a href="/about-us">About Us</a>' +
'      <a href="/reviews">Reviews</a>' +
'      <a href="/pricing">Pricing</a>' +
'      <a href="/locations">Locations</a>' +
'      <a href="/business-info">Business Info</a>' +
'      <a class="btn btn-orange" href="/contact">Free Quote</a>' +
'      <a class="btn btn-white" href="/business-info">Contact Us</a>' +
'  </div>' +
'</header>';

  var mail = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>';
  var ig = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/></svg>';
  var fb = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 9V7.2c0-.9.2-1.4 1.5-1.4H17V2.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V9H7.7v3.2h2.6V21H14v-8.8h2.6l.4-3.2H14z"/></svg>';
  var phone = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.4 2.2z"/></svg>';

  var footer =
'<section class="foot-cta" data-screen-label="Footer CTA">' +
'  <div class="wrap">' +
'    <p class="eyebrow" data-reveal>Schedule Your Next Clean</p>' +
'    <h2 class="display display--md accent" data-reveal data-d="1">Today<span style="color:#fff;">!</span></h2>' +
'    <p data-reveal data-d="1">We are so confident in the work we do, that if you aren\'t 100% satisfied, we will refund you every single penny… sound fair enough?</p>' +
'    <a class="btn btn-orange btn-lg" href="/contact" data-reveal data-d="2">Free Quote</a>' +
'  </div>' +
'</section>' +
'<footer class="footer">' +
'  <div class="wrap">' +
'    <div class="footer__grid">' +
'      <div class="footer__brand foot-contact">' +
'        <img class="foot-logo" src="images/clear-clean/logo-wordmark.webp" alt="Clear & Clean Window Cleaning" />' +
'        <div class="social-row">' +
'          <a class="icon-btn" href="mailto:info@clearandcleanwindowcleaning.com" aria-label="Email">' + mail + '</a>' +
'          <a class="icon-btn" href="https://www.instagram.com/the.big.rise/" target="_blank" rel="noopener" aria-label="Instagram">' + ig + '</a>' +
'          <a class="icon-btn" href="https://www.facebook.com/profile.php?id=100094162891933" target="_blank" rel="noopener" aria-label="Facebook">' + fb + '</a>' +
'        </div>' +
'        <h4 class="foot-h">Contact Us</h4>' +
'        <a href="mailto:info@clearandcleanwindowcleaning.com">' + mail + ' info@clearandcleanwindowcleaning.com</a>' +
'        <a href="tel:+19728905467">' + phone + ' (972) 890-5467</a>' +
'      </div>' +
'      <div class="foot-col">' +
'        <h4 class="foot-h">Company</h4>' +
'        <ul>' +
'          <li><a href="/contact">Contact</a></li>' +
'          <li><a href="/about-us">About Us</a></li>' +
'          <li><a href="/reviews">Reviews</a></li>' +
'          <li><a href="/pricing">Pricing</a></li>' +
'          <li><a href="/partnerships">Partnerships</a></li>' +
'          <li><a href="/business-info">Business Info</a></li>' +
'        </ul>' +
'      </div>' +
'      <div class="foot-col">' +
'        <h4 class="foot-h">Services</h4>' +
'        <ul>' +
'          <li><a href="/exterior-window-cleaning">Exterior Window Washing</a></li>' +
'          <li><a href="/interior-window-cleaning">Interior Window Washing</a></li>' +
'          <li><a href="/track-cleaning">Track Cleaning</a></li>' +
'          <li><a href="/screen-cleaning">Screen Cleaning</a></li>' +
'          <li><a href="/gutter-cleaning">Gutter Cleaning</a></li>' +
'          <li><a href="/solar-panel-cleaning">Solar Panel Cleaning</a></li>' +
'          <li><a href="/screen-repair">Screen Repair</a></li>' +
'          <li><a href="/holiday-lighting">Holiday Lighting</a></li>' +
'        </ul>' +
'      </div>' +
'      <div class="foot-col">' +
'        <h4 class="foot-h">Locations</h4>' +
'        <ul>' +
'          <li><a href="/locations">Collin County</a></li>' +
'          <li><a href="/locations">Dallas County</a></li>' +
'          <li><a href="/locations">Denton County</a></li>' +
'          <li><a href="/locations">Tarrant County</a></li>' +
'          <li><a href="/locations">All Service Areas</a></li>' +
'        </ul>' +
'      </div>' +
'    </div>' +
'    <div class="footer__bottom">' +
'      <span class="footer__copy">© <span id="year">2026</span> Clear & Clean Window Cleaning. All rights reserved.</span>' +
'      <a class="footer__amplify" href="https://www.theamplify.studio" target="_blank" rel="noopener" aria-label="Powered by Amplify"><img src="images/powered-by-amplify.png" alt="Powered by Amplify" /></a>' +
'    </div>' +
'  </div>' +
'</footer>';

  var navMount = document.getElementById("site-nav");
  if (navMount) navMount.outerHTML = nav;
  var footMount = document.getElementById("site-footer");
  if (footMount) footMount.outerHTML = footer;

  // highlight the current page in the nav
  var here = (location.pathname.split("/").pop() || "index.html");
  document.querySelectorAll(".nav__link, .nav__panel a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === here) a.classList.add("is-active");
  });
})();
