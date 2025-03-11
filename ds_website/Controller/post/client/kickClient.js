import client from "../../../../ds bot/main.js";

export default async function kickClient(request, response) {
  const serverId = request.session.serverPageId;
  const guild = client.guilds.cache.get(serverId);
  await guild.leave();
  return response.json({ message: "Client left the server" });
}
