import client from "../../../../../ds_bot/main.js";

export default async function shareWithFriends(request, response) {
  const { shareLink, channelId } = request.body;

  try {
    const serverId = request.session.serverPageId;
    const server = await client.guilds.fetch(serverId);
    const channel = await server.channels.fetch(channelId);
    await channel.send(shareLink);
    return response.json({ message: "Profile shared!" });
  } catch (error) {
    return response.json({
      error: "Something went wrong trying to share profile",
    });
  }
}
