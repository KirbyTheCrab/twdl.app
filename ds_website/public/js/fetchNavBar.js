await fetch("/template/navbar.html")
  .then((response) => response.text())
  .then((data) => {
    const isLoggedInscript = document.createElement("script");
    isLoggedInscript.src = "/js/isLoggedIn.js";
    isLoggedInscript.type = "module";
    document.head.appendChild(isLoggedInscript);
    document.getElementById("navbar").innerHTML = data;
  });
