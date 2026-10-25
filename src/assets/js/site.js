// JMHC website script: menu, forms (Web3Forms), donation "other" amount.
(function () {
  // Mobile menu
  var nav = document.getElementById("nav");
  var btn = document.getElementById("menuBtn");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Donation: show the "other amount" box only when Other is chosen
  var otherWrap = document.getElementById("otherWrap");
  document.querySelectorAll('input[name="amount"]').forEach(function (r) {
    r.addEventListener("change", function () { if (otherWrap) otherWrap.hidden = r.value !== "Other"; });
  });

  // Forms: send to Web3Forms and show a message without leaving the page.
  // If the access key is not set yet, point people to WhatsApp and email instead of pretending to send.
  var fallback = "Online forms open shortly. For now, please send these details by WhatsApp to +234 814 019 6264 or email info@josmhconference.com.";
  document.querySelectorAll("form[data-web3forms]").forEach(function (form) {
    var status = form.querySelector(".status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var key = form.querySelector('[name="access_key"]');
      if (!key || !key.value) { status.setAttribute("data-state", "error"); status.textContent = fallback; return; }
      var b = form.querySelector("[type=submit]");
      var label = b.textContent;
      b.disabled = true; b.textContent = "Sending…";
      fetch("https://api.web3forms.com/submit", { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data.success) throw new Error();
          form.reset();
          if (otherWrap) otherWrap.hidden = true;
          status.setAttribute("data-state", "ok");
          status.textContent = form.getAttribute("data-ok") || "Thank you. We have received your message.";
        })
        .catch(function () {
          status.setAttribute("data-state", "error");
          status.textContent = "Sorry, that didn't send. Please try again, or WhatsApp +234 814 019 6264.";
        })
        .then(function () { b.disabled = false; b.textContent = label; status.focus(); });
    });
  });
})();
