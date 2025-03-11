import fs from "fs-extra";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

export default async function isEnabled(request, response) {
  const guildID = request.session.serverPageId;
  const { str } = request.query;
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const filePath = path.join(
    __dirname,
    `../../../../Model/${str}/${guildID}.json`
  );
  try {
    if (fs.existsSync(filePath)) {
      return response.json({ isEnabled: true });
    } else {
      return response.json({ isEnabled: false });
    }
  } catch (error) {
    return false;
  }
}
