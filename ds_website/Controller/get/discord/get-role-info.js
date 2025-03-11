import client from "../../../../ds bot/main.js";

export default async function getRoleInfo(request, response) {
  const { guildId, roleId } = request.query;
  const guild = await client.guilds.fetch(guildId);
  const role = await guild.roles.fetch(roleId);
  return response.json({ role });
}
