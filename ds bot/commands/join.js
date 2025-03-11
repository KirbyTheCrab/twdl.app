import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("join")
  .setDescription("Destiny two join code made nicer")
  .addStringOption((option) => option
    .setName("input")
    .setDescription("The input to add to the activity list")
    .setRequired(true)
  );
export async function execute(interaction) {
  if (!interaction.isChatInputCommand()) return;
  let joinCode = await interaction.options.getString("joincode");
  const message = joinMessage(joinCode);
  await interaction.reply({ embeds: [message] });
}

function joinMessage(joinCode) {
  const joinMessage = {
    title: "Join init cuh",
    description: "you can join the fool? tf do I need to explain? " + joinCode,
  };

  return joinMessage;
}
