import client from "../../../../ds_bot/main.js";
import fs from "fs";
export default async function changeGuildIcon(request, response) {
  const serverId = request.session.serverPageId;
  try {
    const guild = await client.guilds.fetch(serverId);
    const newIconFilePath = request.file.path;
    const image = fs.readFileSync(newIconFilePath);
    await guild.setIcon(image);
    fs.unlinkSync(newIconFilePath);
    return response.json({
      message: `Changed guild icon to provided image successfully`,
    });
  } catch (error) {
    return response.json({
      error: `Unable to change guild icon at this time ` + error,
    });
  }
}
