export default async function isUserMod(userId, serverId) {
  const response = await fetch(
    `/discord-data/client/is-user-mod?userId=${userId}&serverId=${serverId}`
  );
  const data = await response.json();
  return data.isMod;
}
