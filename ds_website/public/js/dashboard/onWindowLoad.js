import ServerData from "./fetch/serverData.js";
import User from "./fetch/userData.js";
import getIsUserDataFetched from "./fetch/isUserDataFetched.js";
import updateIsDataFetched from "./post/updateIsDataFetched.js";
import setAccessToken from "./post/setAccessToken.js";

const user = new User();
const serverData = new ServerData();

const pageLoading = async () => {
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const [accessToken, tokenType] = [
    fragment.get("access_token"),
    fragment.get("token_type"),
  ];
  await setAccessToken(accessToken);
  if (!accessToken || !tokenType) {
    window.location.href = "/";
  } else {
  }
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
