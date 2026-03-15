import client from "../../../../../ds bot/main.js";
import discord_pkg from "discord.js"
const { EmbedBuilder } = discord_pkg

import fs from "fs-extra";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

export default async function shareLinkTrade(request, response) {
  const { tradeLinkValue, channelId } = request.body;
  const userId = request.session.userId;
  const serverId = request.session.serverPageId;
  try {
    const server = await client.guilds.fetch(serverId);
    const member = await server.members.fetch(userId);
    const channel = await server.channels.fetch(channelId);
    const isSaved = await saveTradeLink(tradeLinkValue, member.user.id);
    if (!isSaved.success) {
      return response.json({ error: "An error occurred saving the trade link" })
    }

    const embedBuilder = new EmbedBuilder()
      .setColor(`#075A8D`)
      .setTitle(`Steam Trade Link`)
      .setDescription(
        `<@${member.user.id}> has shared their trade link with the server!`
      )
      .setURL(tradeLinkValue)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setAuthor({
        name: "TWDL 2.0",
        iconURL: "https://i.imgur.com/98RyXhh.png",
      });

    await channel.send({ embeds: [embedBuilder] });
    return response.json({ message: "Trade Link Shared and Saved!" });
  } catch (error) {
    console.error(error);
    return response.json({
      error: "Something went wrong trying to share profile",
    });
  }
}

async function saveTradeLink(tradeLink, userId) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  let filePath;
  try {
    filePath = path.join(__dirname, `../../../../Model/cs2Tracker/userTradeLink.json`);
  } catch (error) {
    return { success: false, message: "Something went wrong trying to save trade link" }
  }

  let existingData = [];
  try {
    if (await fs.pathExists(filePath)) {
      const fileContent = await fs.readFile(filePath, "utf-8");
      existingData = JSON.parse(fileContent);
    }
    const userProfile = existingData.find(tl => tl.userId === userId);
    if (userProfile) {
      userProfile.tradeLink = tradeLink;
    } else {
      const data = {
        "userId": userId,
        "tradeLink": tradeLink
      }
      existingData.push(data);
    }
    await fs.writeFile(filePath, JSON.stringify(existingData, null, 2), "utf-8");
    if (userProfile) {
      return { success: true, message: "Trade link updated." }
    } else {
      return { success: true, message: "Trade Link saved." }
    }
  } catch (error) {
    console.error(error);
    return { success: false, error: "Unable to save trade link" };
  }
}
