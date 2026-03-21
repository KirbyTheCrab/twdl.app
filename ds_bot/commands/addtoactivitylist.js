import discord_pkg from "discord.js"
const { SlashCommandBuilder } = discord_pkg
import userWarnings from "../events/userWarnings.js";

const {
  addToForbiddenActivityList,
} = userWarnings;

export const data = new SlashCommandBuilder()
  .setName("addtoactivitylist")
  .setDescription("Add Forbidden activity to list")
  .addStringOption((option) =>
    option
      .setName("input")
      .setDescription("The input to add to the activity list")
      .setRequired(true)
  );

export async function execute(interaction) {
  if (!interaction.isCommand()) return;
  try {
    const input = interaction.options.getString("input");
    await addToForbiddenActivityList(input, interaction);
  } catch (error) {
    console.error("Error processing command:", error);
    await interaction.reply("There was an error processing your command.");
  }
  
}