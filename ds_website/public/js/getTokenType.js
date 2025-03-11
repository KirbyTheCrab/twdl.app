export default async function getAccessToken() {
  return await fetch("/session/accessToken")
    .then((response) => response.json())
    .then((response) => {
      return response.accessToken;
    });
}
