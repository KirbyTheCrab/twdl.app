import { readdir } from "fs/promises"; // Use the promises API to read directories
import { fileURLToPath } from "url";

import dotenv from "dotenv";
dotenv.config();

import setup from "../setup.js";
const { client, commandsPath, client_id, client_token } = setup;
import { Collection, REST, Routes } from "discord.js";
const rest = new REST({ version: "10" }).setToken(client_token);

import { data as addToForbiddenActivityListCommand } from "../commands/addtoactivitylist.js";
import { data as displayForbiddenActivityListCommand } from "../commands/displayforbiddenactivitylist.js";
import { data as removeFromForbiddenActivityListCommand } from "../commands/removefromactivitylist.js";
import { data as getusersCommand } from "../commands/getusers.js";
import {data as helpCommand} from '../commands/help.js'
import {data as joinCommand} from '../commands/join.js'
const argSlashCommands = [
  addToForbiddenActivityListCommand,
  removeFromForbiddenActivityListCommand,
  displayForbiddenActivityListCommand,
  getusersCommand,
  helpCommand,
  joinCommand
];
import commands from "../listOfCommands.js";

class CommandCreater {
  async createGuildCommands() {
    try {
      await rest.put(
        Routes.applicationGuildCommands(client_id, process.env.TESTGUILD_ID),
        { body: commands }
      );
      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error("Error with slash commands:", error);
    }
  }
  async createGlobalApplicationSlashCommands() {
    for (const command of argSlashCommands) {
      try {
        await client.application.commands.create(command);
        // console.log(
        //   `\n-----------------------------\nCreated command: ${command.name}\nDescription: ${command.description}\n-----------------------------`
        // );
      } catch (error) {
        console.error("Error registering command:", error);
      }
    }
  }
  async setCommands() {
    client.commands = new Collection();
    const commandFiles = await readdir(commandsPath);

    for (const file of commandFiles) {
      if (file.endsWith(".js")) {
        // Ensure only JS files are processed
        const filePath = new URL(file, `file://${commandsPath}/`).href; // Create the URL for the import
        const command = await import(filePath); // Await the dynamic import
        if ("data" in command && "execute" in command) {
          client.commands.set(command.data.name, command);
          console.log(`${command.data.name} has been set`);
        } else {
          console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
          );
        }
      }
    }
  }
}

export default CommandCreater;
