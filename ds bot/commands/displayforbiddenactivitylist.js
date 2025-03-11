import { SlashCommandBuilder } from "discord.js";
import { readFileSync } from "node:fs";
let tempList = [];

export const data = new SlashCommandBuilder()
  .setName("displayforbiddenactivitylist")
  .setDescription("Show all the forbidden activities");

export async function execute(interaction) {
  if (!interaction.isCommand()) return;
  try {
    const jsonData = readFileSync("json/forbiddenActivityList.json", "utf-8");
    tempList = JSON.parse(jsonData);
    tempList.join("\n");
    if (tempList.length < 1) {
      await interaction.reply(`Forbidden Activity list is empty`);
    } else {
      await interaction.reply(`Forbidden Activity list ${tempList}`);
    }
  } catch (error) {
    console.error("Error processing command:", error);
    await interaction.reply("There was an error processing your command.");
  }
}
