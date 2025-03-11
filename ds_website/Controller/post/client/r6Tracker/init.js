import fs from "fs-extra";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
/**
 * Creates a file with guild id representing that r6 tracker has been enabled for this guild
 * @param {*} request
 * @param {*} response
 * @returns
 */
export default async function r6Init(request, response) {
  const guildID = request.session.serverPageId;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  let filePath;
  try {
    filePath = path.join(
      __dirname,
      `../../../../Model/r6Tracker/${guildID}.json`
    );
  } catch (error) {
    console.log("This guild does not have any saved reaction roles");
    return;
  }

  try {
    await fs.writeJson(filePath, []);
    await fs.createFile(filePath);
    return response.json({ message: "R6 Tracker initialised" });
  } catch (error) {
    return response.json({ error: `Something went wrong ${error}` });
  }
}
