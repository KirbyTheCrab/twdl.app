import client from "../../../../ds bot/main.js";

export default async function kickClient(request, response) {
  const serverId = request.session.serverPageId;
  try {
    const guild = await client.guilds.fetch(serverId);
    await guild.leave();
    return response.json({ message: "Client left the server" });
  } catch (error) {
    console.error("Unable to leave server", error);
    return response.status(500).json({ error: "Unable to leave server at this time" });
  }
}
