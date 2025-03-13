import ServerData from "./fetch/serverData.js";
import User from "./fetch/userData.js";
import getIsUserDataFetched from "./fetch/isUserDataFetched.js";
import updateIsDataFetched from "./post/updateIsDataFetched.js";
import setAccessToken from "./post/setAccessToken.js";

const user = new User();
const serverData = new ServerData();

const pageLoading = async () => {
  const [accessTokenRes, tokenTypeRes] = await Promise.all([
    fetch("/session/accessToken").then((res) => res.json()),
    fetch("/session/tokenType").then((res) => res.json()),
  ]);

  const accessToken = accessTokenRes.accessToken;
  const tokenType = tokenTypeRes.tokenType;
  if (!accessToken || !tokenType) {
    window.location.href = "/";
  }
  await setAccessToken(accessToken);

  //must fetch user data before server data
  try {
    const isUserDataFetchedLocal = await getIsUserDataFetched();
    if (!isUserDataFetchedLocal) {
      await user.fetchUserData(tokenType, accessToken);
      await serverData.fetchServerData(tokenType, accessToken, user);
      await updateIsDataFetched();
    }
  } catch (error) {
    console.error("Unable to retrieve user or server data");
  }
};

window.onload = pageLoading;
window.onpopstate = pageLoading;
