import client from "../../../../ds bot/main.js";

export default async function changeClientNickName(request, response) {
  const serverId = request.session.serverPageId;
  const clientId = "1089904140685164686"; //public information
  const { nickname } = request.query;
  try {
    const guild = await client.guilds.fetch(serverId);
    const userData = await guild.members.fetch(clientId);
    if (userData.nickname === nickname) {
      return response.json({ error: "Client already has that nickname" });
    } else {
      await userData.setNickname(`${nickname}`);
      return response.json({
        message: `Changed client nickname to ${nickname}`,
      });
    }
  } catch (error) {
    return response.json({
      error: `Unable to change client nickname at this time`,
    });
  }
}
