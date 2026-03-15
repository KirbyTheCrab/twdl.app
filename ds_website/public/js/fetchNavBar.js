try {
  const response = await fetch("/template/navbar.html");
  const data = await response.text();
  document.getElementById("navbar").innerHTML = data;

  const isLoggedInscript = document.createElement("script");
  isLoggedInscript.src = "/js/isLoggedIn.js";
  isLoggedInscript.type = "module";
  document.head.appendChild(isLoggedInscript);
} catch (error) {
  const navbarElement = document.getElementById("navbar");
  if (navbarElement) {
    navbarElement.innerHTML = "<p>Navigation unavailable right now.</p>";
  }
}
