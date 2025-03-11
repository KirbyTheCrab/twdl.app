import fs from "fs-extra";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function reloadWelcomeMessage(guildID) {
  const filePath = path.join(
    __dirname,
    `../../ds_website/Model/welcomeMessage/${guildID}.json`
  );
  if (!filePath) return;
  try {
    const data = await fs.readFile(filePath, "utf-8");
    const activeWelcomeMessage = JSON.parse(data);
    return activeWelcomeMessage;
  } catch (error) {
    return error;
  }
}
