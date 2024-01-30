(function () {
  function trackAnalyticsEvent(type = "click", args = {}) {
    if (typeof window.gtag === "function") {
      window.gtag("event", type, args);
    }
  }

  document.getElementById("contactBtn").onclick = function () {
    trackAnalyticsEvent("open_contact", {});
    document.getElementById("contactModal").style.display = "block";
  };

  document.getElementsByClassName("close")[0].onclick = function () {
    document.getElementById("contactModal").style.display = "none";
  };

  window.onclick = function (event) {
    let modal = document.getElementById("contactModal");
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  const form = document.getElementById("contactForm");
  form.onsubmit = function (event) {
    event.preventDefault();
    // Add form submission logic here
    trackAnalyticsEvent("form_submitted", {
      email: document.getElementById("email").value,
    });
    alert("Form submitted!");
    document.getElementById("contactModal").style.display = "none";
  };
})();
