import client from "../../../../ds_bot/main.js";

export default async function getTextChannels(request, response) {
  const serverId = request.session.serverPageId;
  const server = await client.guilds.fetch(serverId);
  const channels = server.channels.cache;
  let textChannels = [];
  channels.forEach((channel) => {
    if (channel.isTextBased()) {
      textChannels.push(channel);
    }
  });
  return response.json({ textChannels });
}
