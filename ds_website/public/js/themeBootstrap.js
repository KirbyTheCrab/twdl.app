const savedTheme = localStorage.getItem("twdl-theme");
if (savedTheme && savedTheme !== "ocean") {
  document.documentElement.dataset.theme = savedTheme;
}