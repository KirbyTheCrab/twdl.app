import client from "../../../../ds_bot/main.js";
//gives us all the servers that the bot is in in hashmaps
export default async function getClientServers(request, response) {
  try {
    await client.guilds.fetch();
    const clientServersList = [...client.guilds.cache.keys()];
    return response.json({ clientServersList });
  } catch (error) {
    console.error("Unable to fetch client server list", error);
    return response.status(500).json({ error: "Unable to fetch server list" });
  }
}