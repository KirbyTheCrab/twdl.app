import client from "../../../../ds_bot/main.js";
export default async function changeGuildName(request, response) {
  const serverId = request.session.serverPageId;
  const { name } = request.query;

  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
    return response.status(400).json({ error: "Guild name must be between 2 and 100 characters" });
  }

  try {
    const guild = await client.guilds.fetch(serverId);
    const safeName = name.trim();
    await guild.setName(safeName);
    return response.json({
      message: `Changed guild name to ${safeName} successfully`,
    });
  } catch (error) {
    console.error("Unable to change guild name", error);
    return response.status(500).json({
      error: "Unable to change guild name at this time",
    });
  }
}
