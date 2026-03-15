await fetch("/session/isLoggedIn")
  .then((response) => response.json())
  .then(async (data) => {
    const loginBtn = document.getElementById("login");
    const logoutBtn = document.getElementById("logout");
    const dashboardBtn = document.getElementById("dashboard");

    if (!loginBtn || !logoutBtn || !dashboardBtn) {
      return;
    }

    if (data.isLoggedIn) {
      dashboardBtn.style.display = "flex";
      dashboardBtn.href = "/dashboard";
      logoutBtn.style.display = "flex";
      loginBtn.style.display = "none";
    } else {
      loginBtn.style.display = "flex";
      dashboardBtn.style.display = "none";
      logoutBtn.style.display = "none";
    }
  });
