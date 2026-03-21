import client from "../../../../../ds_bot/main.js";
import discord_pkg from "discord.js"
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = discord_pkg

function normalizeDiscordColor(rawColor) {
  if (!rawColor || typeof rawColor !== "string") return "#2bc0ff";
  const clean = rawColor.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return "#2bc0ff";
  return `#${clean}`;
}

function isSafeHttpUrl(value) {
  if (!value || typeof value !== "string") return false;
  return /^https?:\/\//i.test(value);
}

function rarityBadge(rarity) {
  const normalized = (rarity || "Unknown").toLowerCase();
  const badges = {
    extraordinary: "🟣",
    covert: "🔴",
    classified: "🔵",
    restricted: "🟣",
    remarkable: "🩷",
    "high grade": "🔷",
    "mil-spec grade": "🟦",
    "industrial grade": "🟪",
    "consumer grade": "⬜",
    "base grade": "⚪",
  };
  const icon = badges[normalized] || "🔹";
  return `${icon} **${rarity || "Unknown"}**`;
}

export default async function shareItem(request, response) {
  const { channelId, itemData } = request.body;
  const serverId = request.session.serverPageId;
  const userId = request.session.userId;

  const server = await client.guilds.fetch(serverId);
  const member = await server.members.fetch(userId);
  const channel = await server.channels.fetch(channelId);

  try {
    if (!channel || !channel.isTextBased()) {
      return response.json({ error: "Selected channel is not a text-based channel." });
    }

    const itemColor = normalizeDiscordColor(itemData.itemColor);
    const itemName = itemData.itemName || "CS2 Item";
    const itemPrice = itemData.itemPrice || "N/A";
    const itemType = itemData.itemType || "Unknown";
    const itemRarity = itemData.itemRarity || "Unknown";
    const itemExterior = itemData.itemExterior || "Unknown";
    const rarityDisplay = rarityBadge(itemRarity);
    const marketHashName = itemData.marketHashName || itemName;
    const marketUrl = `https://steamcommunity.com/market/listings/730/${encodeURIComponent(marketHashName)}`;
    const inspectUrl = isSafeHttpUrl(itemData.inspectInGameLink)
      ? itemData.inspectInGameLink
      : `${process.env.BASE_URL}/inspect-item?link=${encodeURIComponent(itemData.inspectInGameLink || "")}`;

    const embedBuilder = new EmbedBuilder()
      .setColor(itemColor)
      .setTitle(itemName)
      .setURL(marketUrl)
      .setDescription("A fresh CS2 item was just shared. Use the quick actions below to inspect, check market listing, or trade.")
      .setThumbnail(
        `https://steamcommunity-a.akamaihd.net/economy/image/${itemData.itemIconStr}`
      )
      .setAuthor({
        name: `${member.displayName} shared a new CS2 item`,
        iconURL: member.user.displayAvatarURL({ dynamic: true }),
      })
      .addFields(
        { name: "Owner", value: `<@${userId}>`, inline: true },
        { name: "Market Price", value: `**${itemPrice}**`, inline: true },
        { name: "Type", value: `\`${itemType}\``, inline: true },
        { name: "Rarity", value: rarityDisplay, inline: true },
        { name: "Exterior", value: `\`${itemExterior}\``, inline: true },
        { name: "Server", value: server.name || "Unknown", inline: true },
      )
      .setFooter({ text: "TWDL CS2 Marketplace • Happy Trading" })
      .setTimestamp();

    const row = new ActionRowBuilder();

    if (inspectUrl && inspectUrl.includes("http")) {
      const inspectLink = new ButtonBuilder()
        .setLabel("Inspect")
        .setStyle(ButtonStyle.Link)
        .setURL(inspectUrl);
      row.addComponents(inspectLink);
    }

    const marketButton = new ButtonBuilder()
      .setLabel("View Market")
      .setStyle(ButtonStyle.Link)
      .setURL(marketUrl);
    row.addComponents(marketButton);

    const itemTradeLink = `${itemData.tradeLink}/${itemData.assetId}/&contextid=2&appid=730`;
    if (isSafeHttpUrl(itemTradeLink)) {
      const tradeItem = new ButtonBuilder()
        .setLabel("Trade Item")
        .setStyle(ButtonStyle.Link)
        .setURL(itemTradeLink);
      row.addComponents(tradeItem);
    }

    const messagePayload = { embeds: [embedBuilder] };
    if (row.components.length > 0) {
      messagePayload.components = [row];
    }

    await channel.send(messagePayload);
    return response.json({ message: "Item shared in designated text channel" })
  } catch (error) {
    console.error(error);
    return response.json({ error: `Unable to share this item` });
  }
}
