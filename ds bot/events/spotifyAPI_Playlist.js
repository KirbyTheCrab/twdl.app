import dotenv from "dotenv";
import SpotifyWebAPI from "spotify-web-api-node";
import { promises as fs } from "node:fs";
import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
dotenv.config();

export default class SpotifyBuddieSystem {
  serverId;
  playlistConfig;
  client;
  spotifyApi;

  constructor(serverId, playlistConfig, client) {
    this.serverId = serverId;
    this.playlistConfig = playlistConfig;
    this.client = client;
    this.spotifyApi = new SpotifyWebAPI({
      clientId: process.env.SPOTIFY_API_ID,
      clientSecret: process.env.SPOTIFY_API_SECRET,
    });
    this.pollPlaylist();
  }

  async pollPlaylist() {
    const { playlistId, notificationChannel, queueCount, spotifyBuddies, playlistSnapshot, messageType } = this.playlistConfig;
    try {
      if (!this.spotifyApi.getAccessToken()) {
        await this.authenticate();
      }
      const playlistData = await this.getPlaylistData(playlistId);
      const songsInPlaylist = playlistData.tracks.items;
      // songsInPlaylist.forEach((item) => {
      //   console.log(`Added by: ${item.added_by.id}`);
      // })
      const newSnapshot = await this.getSnapshotId(playlistId);
      // console.log(`Current Snapshot: ${playlistSnapshot}\nNew Snapshot: ${newSnapshot}\n`);

      //might need to delete this if
      if (!playlistSnapshot) {
        await this.saveToFile(newSnapshot, "playlistSnapshot", playlistId);
        console.log("Initial playlist snapshot saved.");
        return;
      }
      // Check if the snapshot has changed
      if (newSnapshot !== playlistSnapshot) { //check if snapshot is the same as last time (no songs added or a song has been added if song has been added)
        let updatedQueueCount;
        //if queue count is equal to spotify buddie array size -> reset queue count and save to file
        if (queueCount >= spotifyBuddies.length - 1) {
          updatedQueueCount = 0;
        } else {
          updatedQueueCount = queueCount + 1;
        }
        await this.saveToFile(updatedQueueCount, "queueCount", playlistId);
        await this.saveToFile(newSnapshot, "playlistSnapshot", playlistId);

        this.playlistConfig.playlistSnapshot = newSnapshot; // Update in-memory snapshot
        this.playlistConfig.queueCount = updatedQueueCount; // Update in-memory queue count

        const nextInQueue = spotifyBuddies[updatedQueueCount];
        const message = await this.createMessage(nextInQueue, playlistId);

        if (messageType == "tc") {
          await this.deleteAllmessages(notificationChannel);
        }
        await this.sendDiscordMessage(message, messageType, nextInQueue, notificationChannel);
      }
    } catch (error) {
      console.error("Error in pollPlaylist:", error);
      this.spotifyApi.resetAccessToken();
    }

  }

  async getPlaylistData(playlistId) {
    try {
      const data = await this.spotifyApi.getPlaylist(playlistId);
      return data.body;
    } catch (error) {
      console.error("Something went wrong fetching playlist data", error);
      return null;
    }

  }
  //spotifyApiAuth
  async authenticate() {
    try {
      const data = await this.spotifyApi.clientCredentialsGrant();
      this.spotifyApi.setAccessToken(data.body.access_token);
      //console.log("Successfully authenticated Spotify API")
    } catch (error) {
      console.log("Error at authentication for spotify api " + error);
    }
  }
  // Get the current snapshot ID of the playlist
  async getSnapshotId(playlistId) {
    const data = await this.spotifyApi.getPlaylist(playlistId, {
      fields: "snapshot_id",
    });
    return data.body.snapshot_id;
  }
  // Send a message to Discord
  async sendDiscordMessage(message, messageType, userId, notificationChannel) {
    try {
      const server = await this.client.guilds.fetch(this.serverId);
      const channel = await server.channels.fetch(notificationChannel);
      const member = await server.members.fetch(userId);
      if (!server) {
        console.error("Could not find server")
        return;
      }
      if (!channel) {
        console.error("Could not find text-channel");
        return;
      }
      if (!member || !member.user) {
        console.error("Could not find user");
        return;
      }
      if (messageType == "tc") {
        await channel.send(message);
      } else if (messageType == "dm") {
        await member.user.send(message);
      }
    } catch (error) {
      console.log("Something went wrong trying to send out notification", error);
    }
  }
  async deleteAllmessages(channelId) {
    try {
      const guild = await this.client.guilds.fetch(this.serverId);
      const textChannel = await guild.channels.fetch(channelId);
      let channelMessages = await textChannel.messages.fetch();
      while (channelMessages.size > 0) {
        const messagesArray = [...channelMessages.values()];
        await textChannel.bulkDelete(messagesArray);
        // Fetch the remaining messages for the next iteration
        channelMessages = await textChannel.messages.fetch();
      }

      //console.log('All messages deleted successfully.');
    } catch (error) {
      console.error('Error deleting messages:', error);
    }
  }
  async saveToFile(data, field, playlistId) {
    let rawData;
    let jsonData;
    try {
      rawData = await fs.readFile("../ds bot/model/spotifyNoti/serverConfigs.json", "utf-8");
      jsonData = JSON.parse(rawData);
      const serverConfiguration = jsonData.serverConfigs.find(config => config.serverId === this.serverId);
      if (!serverConfiguration) {
        console.log("Server configuration not found");
      }

      const playlist = serverConfiguration.playlists.find(pl => pl.playlistId === playlistId);
      if (!playlist) {
        console.log(`Playlist with ID ${playlistId} not found in server ${this.serverId}`);
      }
      playlist[field] = data;
      await fs.writeFile("../ds bot/model/spotifyNoti/serverConfigs.json", JSON.stringify(jsonData, null, 2));
      console.log(`Updated ${field} for playlist ${playlistId} in server ${this.serverId}`);
    } catch (error) {
      console.log(error);
    }

  }
  async createMessage(nextInQueue, playlistId) {
    const embedBuilder = new EmbedBuilder()
      .setColor("#3BE477")
      .setTitle("New Alert!")
      .setDescription(`A new song has been added, <@${nextInQueue}> you are next up!`)
      .setThumbnail("https://i.imgur.com/A5y5wse.png")
      .setAuthor({
        name: `Spotify Buddie Alert System`,
        iconURL: "https://i.imgur.com/98RyXhh.png",
      });
    const playlistLink = new ButtonBuilder()
      .setLabel("Add a song!")
      .setStyle(ButtonStyle.Link)
      .setURL(`https://open.spotify.com/playlist/${playlistId}`)

    const row = new ActionRowBuilder().addComponents(playlistLink);
    return { embeds: [embedBuilder], components: [row] };
  }
}