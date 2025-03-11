import fs from "fs-extra";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

/**
 *
 * @param {json object} data
 * @returns message
 */
export default async function saveToFile(data, strPath) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  let filePath;
  try {
    filePath = path.join(__dirname, `../../../Model/${strPath}`);
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
    if (Array.isArray(data)) {
      existingData = [...data];
    } else {
      existingData.push(data);
    }
    await fs.writeJson(filePath, existingData, { spaces: 2 });
  } catch (error) {
    console.log(error);
  }
}
