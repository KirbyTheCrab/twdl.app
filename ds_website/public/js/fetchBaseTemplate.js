await fetch("/template/baseTemplate.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("template").innerHTML = data;
  });
