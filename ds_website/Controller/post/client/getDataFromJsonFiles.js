import fs from "fs-extra";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function getDataFromJsonFiles(request, response) {
  const { postFilePath } = request.body;
  const guildID = request.session.serverPageId;

  if (!guildID) {
    return response.status(400).json({ error: "Guild ID is required" });
  }
  const filePath = path.join(
    __dirname,
    `../../../Model/${postFilePath}/${guildID}.json`
  );
  if (!filePath) return;
  try {
    const activeReactionRoles = await fs.readFile(filePath, "utf-8");
    const parsedData = JSON.parse(activeReactionRoles);
    return response.json({ parsedData });
  } catch (error) {
    return response.json({
      error: "Something went wrong trying to retrieve data",
    });
  }
}
