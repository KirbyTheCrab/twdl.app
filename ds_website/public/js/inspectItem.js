const params = new URLSearchParams(window.location.search);
const link = params.get("link");
console.log(link);
if (link && link.startsWith("steam://")) {
    window.location = link;
} else {
    document.body.innerHTML = "<p>Invalid or missing Steam link.</p>";
}