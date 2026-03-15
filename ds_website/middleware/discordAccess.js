import client from "../../ds bot/main.js";

export function requireAuth(request, response, next) {
  if (!request.session?.isLoggedIn) {
    return response.status(401).json({ error: "Authentication required" });
  }
  return next();
}

export function requireServerSelection(request, response, next) {
  if (!request.session?.serverPageId) {
    return response.status(400).json({ error: "No server selected" });
  }
  return next();
}

export async function requireGuildAdmin(request, response, next) {
  const serverId = request.session?.serverPageId;
  const userId = request.session?.userId;

  if (!serverId || !userId) {
    return response.status(400).json({ error: "Missing server or user context" });
  }

  try {
    const guild = await client.guilds.fetch(serverId);
    const member = await guild.members.fetch(userId);
    const isOwner = guild.ownerId === userId;
    const isAdmin = member.permissions.has("Administrator");

    if (!isOwner && !isAdmin) {
      return response.status(403).json({ error: "Insufficient permissions" });
    }

    return next();
  } catch (error) {
    console.error("Permission check failed", error);
    return response.status(500).json({ error: "Unable to verify permissions" });
  }
}
