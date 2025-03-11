import saveToFile from "../saveToFile.js";
export default async function saveUser(request, response) {
  const guildID = request.session.serverPageId;
  const userId = request.session.userId;
  const { platform, username } = request.body;

  try {
    const data = {
      discordUserId: userId,
      platform,
      username,
    };
    await saveToFile(data, `/r6Tracker/${guildID}.json`);
    return response.json({ message: "User saved!" });
  } catch (error) {
    console.log(error);
    return response.json({
      error: "Something went wrong trying to save user",
    });
  }
}
