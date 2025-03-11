import getAccessToken from "./getTokenType.js";

await fetch("/session/isLoggedIn")
  .then((response) => response.json())
  .then(async (data) => {
    const accessToken = await getAccessToken();
    const loginBtn = document.getElementById("login");
    const logoutBtn = document.getElementById("logout");
    const dashboardBtn = document.getElementById("dashboard");
    if (data.isLoggedIn) {
      dashboardBtn.style.display = "flex";
      dashboardBtn.href = `/dashboard#token_type=Bearer&access_token=${accessToken}&expires_in=604800&scope=guilds+identify+applications.commands+guilds.members.read`;
      logoutBtn.style.display = "flex";
    } else {
      loginBtn.style.display = "flex";
    }
  });
