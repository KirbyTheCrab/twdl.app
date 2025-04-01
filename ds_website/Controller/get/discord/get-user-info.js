import client from "../../../../ds bot/main.js";

export default async function getUserInfo(request, response) {
  const { serverid, userid } = request.query;
  const guild = await client.guilds.fetch(serverid);
  const user = await guild.members.fetch(userid);
  return response.json({ user });
}
