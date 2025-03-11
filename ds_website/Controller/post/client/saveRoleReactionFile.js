import saveToFile from "./saveToFile.js";

export default async function saveRoleReactionFile(request, response) {
  const guildID = request.session.serverPageId;
  const activeReactionRoles = request.body;
  await saveToFile(activeReactionRoles, `activeReactionRoles/${guildID}.json`);
  return response.json({ message: "Reaction role removed" });
}
