/* US phone fields: format as (XXX) XXX-XXXX and submit with a +1 prefix. */
(function () {
  "use strict";

  function digitsOnly(value) {
    var digits = String(value || "").replace(/\D/g, "");
    if (digits.length === 11 && digits.charAt(0) === "1") digits = digits.slice(1);
    return digits.slice(0, 10);
  }

  function formatDisplay(value) {
    var digits = digitsOnly(value);
    if (!digits) return "";
    if (digits.length < 4) return "(" + digits;
    if (digits.length < 7) return "(" + digits.slice(0, 3) + ") " + digits.slice(3);
    return "(" + digits.slice(0, 3) + ") " + digits.slice(3, 6) + "-" + digits.slice(6);
  }

  function withCountryCode(value) {
    var digits = digitsOnly(value);
    if (digits.length === 10) return "+1 " + formatDisplay(digits);
    var trimmed = String(value || "").trim();
    if (!trimmed) return "";
    if (/^\+1(\s|$)/.test(trimmed)) return trimmed;
    return "+1 " + trimmed;
  }

  function formatInput(input) {
    var start = input.selectionStart;
    var atEnd = start == null || start === input.value.length;
    var digitsBefore = input.value.slice(0, start || 0).replace(/\D/g, "").length;
    var formatted = formatDisplay(input.value);
    if (input.value === formatted) return;
    input.value = formatted;
    var pos = formatted.length;
    if (!atEnd) {
      var seen = 0;
      pos = 0;
      for (var i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted.charAt(i))) seen++;
        pos = i + 1;
        if (seen >= digitsBefore) break;
      }
    }
    try { input.setSelectionRange(pos, pos); } catch (err) {}
  }

  function bind(input) {
    if (!input || input.getAttribute("data-phone-bound") === "1") return;
    input.setAttribute("data-phone-bound", "1");
    if (!input.getAttribute("inputmode")) input.setAttribute("inputmode", "numeric");
    input.setAttribute("autocomplete", "tel-national");
    input.addEventListener("input", function () { formatInput(input); });
    input.addEventListener("change", function () { formatInput(input); });
    formatInput(input);
  }

  function bindForm(form) {
    if (!form || form.getAttribute("data-phone-submit") === "1") return;
    form.setAttribute("data-phone-submit", "1");
    form.addEventListener("submit", function () {
      var saved = [];
      form.querySelectorAll('input[name="phone"]').forEach(function (input) {
        if (input.type === "hidden") return;
        saved.push({ input: input, value: input.value });
        input.value = withCountryCode(input.value);
      });
      queueMicrotask(function () {
        saved.forEach(function (item) { item.input.value = item.value; });
      });
    }, true);
  }

  document.querySelectorAll('input[type="tel"][name="phone"]').forEach(function (input) {
    bind(input);
    bindForm(input.form);
  });

  window.ClearCleanPhone = {
    digitsOnly: digitsOnly,
    formatDisplay: formatDisplay,
    withCountryCode: withCountryCode
  };
})();
