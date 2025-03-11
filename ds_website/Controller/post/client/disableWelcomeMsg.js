import fs from "fs-extra";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

export default async function disableWelcomeMsg(request, response) {
  const guildID = request.session.serverPageId;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  let filePath;
  try {
    filePath = path.join(
      __dirname,
      `../../../Model/welcomeMessage/${guildID}.json`
    );
  } catch (error) {
    console.log("This guild does not have any saved reaction roles");
    return;
  }
  if (await fs.pathExists(filePath)) {
    fs.unlink(filePath, (error) => {
      if (error) {
        return response.json({
          error: "Something went wrong trying to disable welcome message",
        });
      } else {
        return response.json({
          message: "Welcome message disabled successfully",
        });
      }
    });
  }
}
