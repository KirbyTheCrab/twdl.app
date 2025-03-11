export default async function isUserMod(userId, serverId) {
  const resposne = await fetch(
    `/discord-data/client/is-user-mod?userId=${userId}&serverId=${serverId}`
  );
  const data = await resposne.json();
  return data.isMod;
}
