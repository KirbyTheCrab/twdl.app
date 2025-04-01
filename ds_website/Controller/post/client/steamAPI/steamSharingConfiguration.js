import fs from "fs-extra";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import saveToFile from "../saveToFile.js";

export default async function steamSharingConfiguration(request, response) {
  const { channel, channelKey } = request.body;
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
    //remove current trade link
    const filteredData = existingData.filter((obj) => !obj[channelKey]);
    //save file
    fs.writeFileSync(filePath, JSON.stringify(filteredData, null, 2), "utf8");

    //save new trade link
    saveToFile({ [channelKey]: channel }, `/cs2Tracker/${guildId}.json`);

    return response.json({ message: "Configuration saved" });
  } catch (error) {
    return response.json({ error: error.message });
  }
}
