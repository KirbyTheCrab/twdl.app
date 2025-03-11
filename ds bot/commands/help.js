import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Embed message - help');
export async function execute(interaction) {
  const message = helpEmbed();
  await interaction.reply({ embeds: [message] });
}

function helpEmbed() {
  const helpEmbed = {
    color: parseInt("0xADD8E6", 16),
    title: "**Help page**",
    description:
      "This bot is still under development and new commands will be added soon. You can try these commands out in a designated channel (if there is one).",
    fields: [
      {
        name: "**Commands**",
        value: "\u200B",
      },
      {
        name: `📌/setup ⚙️`,
        value:
          "This will give you instructions on how you can set up the bot for your server(admin/mod only)",
        inline: true,
      },
      {
        name: `📌/join x 👨‍👨‍👦‍👦`,
        value:
          "This command will create you a nice join code, change x with your name and number with # from in-game e.g (.join John#1111)",
        inline: true,
      },
      {
        name: "\u200B",
        value: "\u200B",
        inline: true,
      },
    ],
    thumbnail: {
      url: "https://i.imgur.com/3rTkumM.gif",
    },
  };
  return helpEmbed;
}