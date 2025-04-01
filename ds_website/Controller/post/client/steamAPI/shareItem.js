import client from "../../../../../ds bot/main.js";
import { EmbedBuilder } from "discord.js";

export default async function shareItem(request, response) {
  const { channelId, itemData } = request.body;
  const serverId = request.session.serverPageId;
  const userId = request.session.userId;

  const server = await client.guilds.fetch(serverId);
  const member = await server.members.fetch(userId);
  const channel = await server.channels.fetch(channelId);

  try {
    const embedBuilder = new EmbedBuilder()
      .setColor(itemData.itemColor)
      .setTitle(itemData.itemName)
      .setDescription(`Inspect Link: ${itemData.inspectInGame}`)
      .setThumbnail(
        `https://steamcommunity-a.akamaihd.net/economy/image/${itemData.itemIconStr}`
      )
      .setAuthor({
        name: `Item Owner: ${member.user.username}`,
        iconURL: member.user.displayAvatarURL({ dynamic: true }),
      });
    await channel.send({ embeds: [embedBuilder] });
  } catch (error) {
    return response.json({ error: "Unable to share this item" });
  }
}
