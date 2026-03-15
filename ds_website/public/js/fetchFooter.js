try {
  const response = await fetch("/template/footer.html");
  const data = await response.text();
  document.getElementById("footer").innerHTML = data;
} catch (error) {
  const footerElement = document.getElementById("footer");
  if (footerElement) {
    footerElement.innerHTML = "<p>Footer unavailable right now.</p>";
  }
}