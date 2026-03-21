import client from "../../../../ds_bot/main.js";

export default async function changeClientNickName(request, response) {
  const serverId = request.session.serverPageId;
  const clientId = "1089904140685164686"; //public information
  const { nickname } = request.query;

  if (typeof nickname !== "string" || nickname.trim().length < 2 || nickname.trim().length > 32) {
    return response.status(400).json({ error: "Nickname must be between 2 and 32 characters" });
  }

  try {
    const guild = await client.guilds.fetch(serverId);
    const userData = await guild.members.fetch(clientId);
    const safeNickname = nickname.trim();
    if (userData.nickname === safeNickname) {
      return response.status(400).json({ error: "Client already has that nickname" });
    } else {
      await userData.setNickname(`${safeNickname}`);
      return response.json({
        message: `Changed client nickname to ${safeNickname}`,
      });
    }
  } catch (error) {
    console.error("Unable to change client nickname", error);
    return response.status(500).json({
      error: "Unable to change client nickname at this time",
    });
  }
}
