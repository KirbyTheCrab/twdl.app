export default async function updateIsDataFetched() {
  await fetch("/session/setIsDataFetched", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((response) => {
      console.log(response.message);
    })
    .catch((error) => {
      console.error("Unable to update session variable", error);
    });
}
