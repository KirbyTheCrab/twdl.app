import client from "../../../../ds bot/main.js";

export default async function getServerRoles(request, response) {
  const serverId = request.session.serverPageId;
  const server = await client.guilds.fetch(serverId);
  const roles = server.roles.cache;
  return response.json({ roles });
}
