import { guild } from "../json/config.json";

const serverId = guild.id_test;
const roleId = guild.rainbowRoleId_test;

function startRainbow() {

  const server = client.guilds.cache.get(serverId);
  const customEmoji = server.emojis.cache.find(
    (emoji) => emoji.name === "rank_diamond"
  );
  if (!server) {
    console.log(`Server not found ${serverId}`);
    return;
  }
  const role = server.roles.cache.get(roleId);
  role.edit({
    name: `${customEmoji} Clown`,
  });
  if (!role) {
    console.log(`Could not find ${role}`);
    return;
  }

  setInterval(() => {
    changeRoleColor(role);
  });
}
export default {
    startRainbow
}