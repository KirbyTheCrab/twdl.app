import fs from "fs-extra";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

export default async function isCs2ItemSharingConfigured(request, response) {
  const guildId = request.session.serverPageId;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  let filePath;
  try {
    filePath = path.join(
      __dirname,
      `../../../../Model/cs2Tracker/${guildId}.json`
    );
  } catch (error) {
    console.log(error);
    return;
  }

  let existingData = [];
  try {
    if (await fs.pathExists(filePath)) {
      const fileContent = await fs.readFile(filePath, "utf-8");
      existingData = JSON.parse(fileContent);
    }
    const foundObject = existingData.find((obj) => obj.itemShareChannel);
    if (foundObject) {
      return response.json(foundObject.itemShareChannel);
    }
    return response.json({ error: "cs2ItemSharingChannel not found" });
  } catch (error) {
    return response.json({ error: error.message });
  }
}
