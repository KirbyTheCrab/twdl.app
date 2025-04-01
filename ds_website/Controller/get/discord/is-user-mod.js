import client from "../../../../ds bot/main.js";

export default async function isUserMod(request, response) {
  const { userId, serverId } = request.query;
  try {
    const guild = await client.guilds.fetch(serverId);
    const member = await guild.members.fetch(userId);
    // Check if the user has Administrator permissions
    const isMod = member.permissions.has("Administrator");
    request.session.isMod = isMod;
    return response.json({ isMod });
  } catch (error) {
    if (error.code === 10004) {
      // console.error(`Guild with id ${serverId} not found`);
      return response.json({ isMod: false });
    }
    console.error("Unable to verify user permissions", error);
    return response
      .status(500)
      .json({ error: "An error occurred while verifying permissions" });
  }
}
