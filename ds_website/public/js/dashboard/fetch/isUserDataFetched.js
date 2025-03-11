export default async function getIsUserDataFetched() {
  return await fetch("/session/isDataFetched")
    .then((response) => response.json())
    .then((response) => response.isDataFetched);
}
