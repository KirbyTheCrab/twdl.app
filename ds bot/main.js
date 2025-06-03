import setup from "./setup.js";
const { Events, client, client_token } = setup;
import userWarnings from "./events/userWarnings.js";
const { getUserDiscordActivity, initialiseForbiddenList } = userWarnings;
import reloadWelcomeMessage from "./handlers/reloadWelcomeMessage.js";
import CommandCreater from "./handlers/command_creater.js";
import { EmbedBuilder } from "discord.js";
import SpotifyBuddieSystem from "./events/spotifyAPI_Playlist.js";
import fs from 'node:fs';

const commandCreater = new CommandCreater();

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing command ${interaction.commandName}:`, error);
    const replyOptions = {
      content: "There was an error while executing this command!",
      ephemeral: true,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyOptions);
    } else {
      await interaction.reply(replyOptions);
    }
  }
});

client.on("presenceUpdate", async (oldMemeber, newMember) => {
  await getUserDiscordActivity(newMember);
});
client.on("ready", getUserDiscordActivity);

//welcome message loader
const welcomeMessage = new Map();
client.on("guildMemberAdd", async (member) => {
  const guildID = member.guild.id;
  welcomeMessage.set(guildID, await reloadWelcomeMessage(guildID));
  const config = welcomeMessage.get(guildID);
  if (!config[0]) return;
  try {
    const { channelID, title, message, color } = config[0];
    const channel = await client.channels.fetch(channelID);
    if (!channel) return console.log("Channel not found");

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setDescription(message)
      .setAuthor({
        name: "TWDL 2.0",
        iconURL: "https://i.imgur.com/98RyXhh.png",
      })
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.log(error);
  }
});

client.on("ready", async () => {
  // const commands = await client.application?.commands.fetch();
  // // Log the ID of each global command
  // commands.forEach(command => {
  //   client.application?.commands.delete(command.id);
  // });
  // await commandCreater.createGlobalApplicationSlashCommands();
  // await commandCreater.createGuildCommands();
  await commandCreater.setCommands();
  await initialiseForbiddenList();
  //Spotify Buddie system polling 
  setInterval(pollEveryServer, 300000); //every 5 minutes
  pollEveryServer();
  console.log(`Logged in as ${client.user.tag}!`);
});

function pollEveryServer() {
  const data = fs.readFileSync('../ds bot/model/spotifyNoti/serverConfigs.json', 'utf8');
  const allServerConfiguration = JSON.parse(data).serverConfigs;
  allServerConfiguration.forEach((serverConfigs) => {
    const { serverId, playlists } = serverConfigs;

    playlists.forEach((playlistConfigs) => {
      try {
        new SpotifyBuddieSystem(serverId, playlistConfigs, client);
      } catch (error) {
        console.error(`Error polling playlist ${playlistConfigs.playlistId} in server ${serverId}`, error)
      }
    })
  })
}
// await startRainbow();
client.login(client_token);
export default client;
