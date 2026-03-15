export function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  if (!loadingScreen) {
    return;
  }
  loadingScreen.classList.add("hidden");
  setTimeout(() => {
    loadingScreen.style.display = "none";
  }, 220);
}

export function showLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  if (!loadingScreen) {
    return;
  }
  loadingScreen.style.display = "grid";
  requestAnimationFrame(() => loadingScreen.classList.remove("hidden"));
}
