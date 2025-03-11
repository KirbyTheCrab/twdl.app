//post action to set token type
export default async function setAccessToken(accessToken) {
  await fetch("/session/setAccessToken", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accessToken }),
  })
    .then((response) => response.json())
    .then((response) => {
      console.log(response.message);
    });
}
