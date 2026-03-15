import discord_pkg from "discord.js"
const { SlashCommandBuilder } = discord_pkg
import findUserByDiscordName from "../model/_getUsers.js";

export const data = new SlashCommandBuilder()
  .setName("getusers")
  .setDescription("Get users from database");

export async function execute(interaction) {
  userId = interaction.user.id;
  let message;
  const result = await findUserByDiscordName(userId);
  if (result && result instanceof User) {
    message = await foundUser(result);
  } else {
    message = await errorFindingUser();
  }
  await interaction.reply({ embeds: [message] });
}

async function errorFindingUser() {
  const couldNotFindUserError = {
    color: parseInt("ff0000", 16),
    title: "**There was an error**",
    description: "We couldn't find you!",
    fields: [
      {
        name: `Our database does not contain your profile`,
        value: `To add yourself use /addUser command`,
      },
    ],
  };
  return couldNotFindUserError;
}

async function foundUser(user) {
  const displayUsersRecords = {
    color: parseInt("1aff00", 16),
    title: "**Users in database**",
    description: "Found you!",
    fields: [
      {
        name: ``,
        value: `<@${user._discord_user_id}>`,
      },
      {
        name: `Here is what we have`,
        value: "",
      },
      {
        name: "Role Count",
        value: `${user._role_count}`,
      },
      {
        name: "Discord User ID",
        value: `${user._discord_user_id}`,
      },
    ],
  };
  return displayUsersRecords;
}
