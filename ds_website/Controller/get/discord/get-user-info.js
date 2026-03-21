import client from "../../../../ds_bot/main.js";

export default async function getUserInfo(request, response) {
  const serverId = request.session.serverPageId;
  const { userId } = request.body;
  const guild = await client.guilds.fetch(serverId);
  const member = await guild.members.fetch(userId);

  const user = {
    user: member,
    isBot: member.user.bot
  }
  return response.json({ user });
}
