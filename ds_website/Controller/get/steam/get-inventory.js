export default async function getSteamUserInventory(request, response) {
  const { steamid, appid, contextid } = request.query;

  try {
    const res = await fetch(
      `https://steamcommunity.com/inventory/${steamid}/${appid}/${contextid}`
    );
    const data = await res.json();
    return response.json(data);
  } catch (error) {
    return error;
  }
}
