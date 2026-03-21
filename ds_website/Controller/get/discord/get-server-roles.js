import client from "../../../../ds_bot/main.js";

export default async function getServerRoles(request, response) {
  const serverId = request.session.serverPageId;
  const server = await client.guilds.fetch(serverId);
  const roles = server.roles.cache.filter(role =>
    role.id !== server.id && !role.managed
  );
  return response.json({ roles });
}
