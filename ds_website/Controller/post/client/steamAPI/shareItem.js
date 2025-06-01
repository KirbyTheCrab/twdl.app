import client from "../../../../../ds bot/main.js";
import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

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
      .setDescription(`Item owner: <@${userId}>\nItem Price: **${itemData.itemPrice}**\n\nUse the "Trade for this item" button below or contact the item owner directly if you are interested. \nHappy Trading!`)
      .setThumbnail(
        `https://steamcommunity-a.akamaihd.net/economy/image/${itemData.itemIconStr}`
      )
      .setAuthor({
        name: `${member.displayName} just shared a new item!`,
        iconURL: member.user.displayAvatarURL({ dynamic: true }),
      });

    const inspectLink = new ButtonBuilder()
      .setLabel("Inspect item in game")
      .setStyle(ButtonStyle.Link)
      .setURL(`http://localhost:53134/inspect-item?link=${encodeURIComponent(itemData.inspectInGameLink)}`)

    const itemTradeLink = `${itemData.tradeLink}/${itemData.assetId}/&contextid=2&appid=730`
    const tradeItem = new ButtonBuilder()
      .setLabel("Trade for this item")
      .setStyle(ButtonStyle.Link)
      .setURL(itemTradeLink)

    const row = new ActionRowBuilder().addComponents(inspectLink, tradeItem);
    await channel.send({ embeds: [embedBuilder], components: [row] });
    return response.json({ message: "Item shared in designated text channel" })
  } catch (error) {
    console.error(error);
    return response.json({ error: `Unable to share this item` });
  }
}
