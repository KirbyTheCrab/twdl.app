import client from "../../../../ds bot/main.js";
export default async function changeGuildName(request, response) {
  const serverId = request.session.serverPageId;
  const { name } = request.query;
  try {
    const guild = await client.guilds.fetch(serverId);
    await guild.setName(name);
    return response.json({
      message: `Changed guild name to ${name} successfully`,
    });
  } catch (error) {
    return response.json({
      error: `Unable to change guild name at this time ` + error,
    });
  }
}
