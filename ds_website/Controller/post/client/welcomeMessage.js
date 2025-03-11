import saveToFile from "./saveToFile.js";

export default async function welcomeMessage(request, response) {
  const guildID = request.session.serverPageId;
  const { channelID, color, message, title } = request.body;
  try {
    const saveData = {
      channelID,
      title,
      message,
      color,
    };
    await saveToFile(saveData, `welcomeMessage/${guildID}.json`);
    return response.json({ message: "Welcome message enabled" });
  } catch (error) {
    return response.json({ error: "Welcome message failed to enable" });
  }
}
