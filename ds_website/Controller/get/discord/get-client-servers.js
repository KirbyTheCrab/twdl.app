import client from "../../../../ds bot/main.js";
//gives us all the servers that the bot is in in hashmaps
export default async function getClientServers(request, response) {
  const serverId = request.session.serverId;
  // console.log(serverId);
  const clientServers = await client.guilds.fetch(serverId);
  const clientServersList = [];
  // console.log(clientServers)
  for (let [key, value] of clientServers) {
    clientServersList.push(key);
  }
  return response.json({ clientServersList });
}