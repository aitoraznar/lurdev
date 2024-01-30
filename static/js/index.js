(function () {
  document.getElementById("contactBtn").onclick = function () {
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

  document.getElementById("contactForm").onsubmit = function (event) {
    event.preventDefault();
    // Add form submission logic here
    alert("Form submitted!");
    document.getElementById("contactModal").style.display = "none";
  };
})();
