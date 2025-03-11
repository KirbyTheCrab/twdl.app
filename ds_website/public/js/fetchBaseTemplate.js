await fetch("/template/baseTemplate.html")
  .then((response) => response.text())
  .then((data) => {
    console.log(data)
    document.getElementById("template").innerHTML = data;
  });
