import ServerInfoPage from "./fetch/serverInfo.js";
import FetchSettingPages from "./fetch/fetchSettingPages.js";

const serverInfoPage = new ServerInfoPage();
const fetchSettingPages = new FetchSettingPages();

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

const pageLoading = async () => {
  const isAuthenticated = await checkAuthentication();
  if (isAuthenticated) {
    await serverInfoPage.serverStats();
    fetchSettingPages.initialiseEventListeners(serverInfoPage);
    console.log("server stats fetched");
  }
};

window.onload = pageLoading;
