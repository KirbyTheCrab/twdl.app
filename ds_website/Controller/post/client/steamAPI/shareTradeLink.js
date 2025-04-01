import client from "../../../../../ds bot/main.js";
import { EmbedBuilder } from "discord.js";

export default async function shareLinkTrade(request, response) {
  const { tradeLink, channelId } = request.body;
  const userId = request.session.userId;
  const serverId = request.session.serverPageId;

  try {
    const server = await client.guilds.fetch(serverId);
    const member = await server.members.fetch(userId);
    const channel = await server.channels.fetch(channelId);

    const embedBuilder = new EmbedBuilder()
      .setColor(`#075A8D`)
      .setTitle(`Steam Trade Link`)
      .setDescription(
        `<@${member.user.id}> has shared their trade link with the server!`
      )
      .setURL(tradeLink)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setAuthor({
        name: "TWDL 2.0",
        iconURL: "https://i.imgur.com/98RyXhh.png",
      });

    await channel.send({ embeds: [embedBuilder] });
    return response.json({ message: "Trade Link Shared!" });
  } catch (error) {
    return response.json({
      error: "Something went wrong trying to share profile",
    });
  }
}
