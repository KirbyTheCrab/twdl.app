import dotenv from "dotenv";
dotenv.config(); // Load environment variables

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Client, GatewayIntentBits, Events, Routes } from "discord.js";

// Create __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

const client_id = process.env.CLIENT_ID;
const client_token = process.env.DISCORD_TOKEN;
const commandsPath = join(__dirname, "commands");

export default {
  Events,
  Routes,
  client,
  client_id,
  client_token,
  commandsPath,
};
