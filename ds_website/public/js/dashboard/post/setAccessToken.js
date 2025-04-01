//post action to set token type
export default async function setAccessToken(accessToken) {
  await fetch("/session/saveToSession", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key: "accessToken", value: accessToken }),
  })
    .then((response) => response.json())
    .then((response) => {
      console.log(response.message);
    });
}
