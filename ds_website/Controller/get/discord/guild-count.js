import client from "../../../../ds bot/main.js";
export default function getGuildCount(request, response) {
  const guildCount = client.guilds.cache.size;
  return response.json({ guildCount });
}
