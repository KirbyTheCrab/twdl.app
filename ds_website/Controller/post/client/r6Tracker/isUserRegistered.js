import fs from "fs-extra";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

export default async function isUserRegistered(request, response) {
  const userId = request.session.userId;
  const { gameTracker } = request.query;
  const guildID = request.session.serverPageId;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  let filePath;
  try {
    filePath = path.join(
      __dirname,
      `../../../../Model/${gameTracker}/${guildID}.json`
    );
  } catch (error) {
    console.log(error);
    return;
  }

  let existingData = [];

  if (await fs.pathExists(filePath)) {
    const fileContent = await fs.readFile(filePath, "utf-8");
    existingData = JSON.parse(fileContent);

    const isUserRegistered = existingData.some(
      (data) => data.discordUserId === userId
    );
    return response.json({ isUserRegistered });
  } else {
    return response.json({ error: "File path does not exists" });
  }
}
