import client from "../../../../ds bot/main.js";
import { EmbedBuilder } from "discord.js";
import saveToFile from "./saveToFile.js";

export default async function createEmbedReaction(request, response) {
  const guildID = request.session.serverPageId;
  const { channel, title, message, favcolor, emoji, role } = request.body;
  const textChannel = await client.channels.fetch(channel);
  try {
    const embedBuilder = new EmbedBuilder()
      .setColor(favcolor)
      .setTitle(title)
      .setDescription(message)
      .setAuthor({
        name: "TWDL 2.0",
        iconURL: "https://i.imgur.com/98RyXhh.png",
      });
    const sentMessage = await textChannel.send({ embeds: [embedBuilder] });
    const messageID = sentMessage.id;

    if (emoji) {
      await sentMessage.react(emoji);

      client.on("messageReactionAdd", async (reaction, user) => {
        if (reaction.partial) {
          try {
            await reaction.fetch();
          } catch (error) {
            console.error("Error fetching reaction:", error);
            return;
          }
        }
        if (
          reaction.message.id === sentMessage.id &&
          reaction.emoji.name === emoji
        ) {
          const guild = reaction.message.guild;
          if (!guild) return;
          const member = guild.members.cache.get(user.id);
          await member.roles.add(role);
        }
      });

      client.on("messageReactionRemove", async (reaction, user) => {
        if (user.bot) return;
        try {
          await reaction.fetch();
        } catch (error) {
          console.error("Error fetching reaction, " + error);
          return;
        }
        if (
          reaction.message.id === sentMessage.id &&
          reaction.emoji.name === emoji
        ) {
          const guild = reaction.message.guild;
          if (!guild) return;
          const member = guild.members.cache.get(user.id);
          await member.roles.remove(role);
        }
      });
    }

    //saving reaction role to json file
    const reactionRoleData = {
      messageID,
      channel,
      title,
      message,
      favcolor,
      emoji,
      role,
    };
    await saveToFile(reactionRoleData, `activeReactionRoles/${guildID}.json`);
    return response.json({ message: "Reaction role created and saved" });
  } catch (error) {
    console.log(error);
    return response.json({
      error: "Unable to create reaction right now." + error,
    });
  }
}
