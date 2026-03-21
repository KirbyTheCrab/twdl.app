import client from "../../../../ds_bot/main.js";

export default async function getGuildData(request, response) {
  try {
    const serverId = request.session.serverPageId;
    const guildData = await client.guilds.fetch(serverId);
    if (guildData) {
      const sanitizedGuildData = JSON.parse(
        JSON.stringify(guildData, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );
      return response.json({ guildData: sanitizedGuildData });
    }
  } catch (error) {
    if (error === "10004") {
      return response.status(404).json({ error: "Guild not found" });
    }
    return response.status(500).json({ error: "Unable to fetch guild data" });
  }
}
