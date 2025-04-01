import ServerInfoPage from "./fetch/serverInfo.js";
import FetchSettingPages from "./fetch/fetchSettingPages.js";
import isUserMod from "../dashboard/fetch/isUserMod.js";
const serverInfoPage = new ServerInfoPage();
const fetchSettingPages = new FetchSettingPages();

const pageLoading = async () => {
  await setIsUserMod();
  const isAuthenticated = await checkAuthentication();
  if (isAuthenticated) {
    await serverInfoPage.serverStats();
    fetchSettingPages.initialiseEventListeners(serverInfoPage);
  }
};
const checkAuthentication = async () => {
  try {
    const response = await fetch("/auth/check");
    if (response.ok) {
      const data = await response.json();
      return data.authenticated;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

const setIsUserMod = async () => {
  const serverId = await fetch("/session/serverPageId")
    .then((res) => res.json())
    .then((data) => data.serverPageId);
  const userId = await fetch("/session/userId")
    .then((res) => res.json())
    .then((data) => data.userId);
  const isMod = await isUserMod(userId, serverId);
  await fetch("/session/saveToSession", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: "isMod", value: isMod }),
  });
};

window.onload = pageLoading;
