import client from "../../../../ds bot/main.js";

export default async function getChannelInfo(request, response) {
    const { channelId } = request.body;
    const guildId = request.session.serverPageId;
    const guild = await client.guilds.fetch(guildId);
    const channel = await guild.channels.fetch(channelId);
    return response.json(channel);
}