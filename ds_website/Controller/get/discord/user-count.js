import client from "../../../../ds bot/main.js";

export default async function getUserCount(request, response) {
  const userCount = client.users.cache.size;
  response.json({ userCount });
}
