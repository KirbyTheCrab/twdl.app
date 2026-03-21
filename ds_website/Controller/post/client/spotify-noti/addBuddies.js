import fs from "fs-extra";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import SpotifyWebAPI from "spotify-web-api-node";
import dotenv from "dotenv";
import discord_pkg from "discord.js"
import configFile from "../../../../../ds_bot/json/config.json" with { type: "json" };
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = discord_pkg
import client from "../../../../../ds_bot/main.js";
dotenv.config();

export default async function addSpotifyBuddies(request, response) {
    const serverId = request.session.serverPageId;
    const createdBy = request.session.userId;

    const currentUserId = request.session.userId;
    const { playlistId, messageType, textChannel, editTextChannel, "spotifyBuddies[]": spotifyBuddies, inviteLink, serverInfo } = request.body;
    const queueCount = 0;
    const notificationChannel = textChannel || editTextChannel;

    try {

        //1.send out spotify playlist collaboration invitations for selected users.
        if (!Array.isArray(spotifyBuddies)) {
            return response.json({ "error": "You must select multiple people" })
        }
        if (!messageType) {
            return response.json({ "error": "You must select a message type" })
        }

        console.log(messageType, notificationChannel);
        if (messageType === "tc" && !notificationChannel) {
            return response.json({ "error": "You must select a text channel" })
        }

        const playlistData = await getPlaylistData(playlistId);
        const playlistSnapshot = playlistData.snapshot_id
        const playlistName = playlistData.name;

        const data = {
            playlistId,
            notificationChannel,
            queueCount,
            playlistSnapshot,
            playlistName,
            spotifyBuddies,
            messageType,
            createdBy,
            inviteLink
        };

        //2.save json object to serverConfig.json in ds_bot/model folder
        const isSaved = await saveToConfigFile(data, serverId);
        if (!isSaved.success) {
            return response.json({ "error": isSaved.error })
        }

        const guild = await client.guilds.fetch(serverId);
        const channel = await guild.channels.fetch(notificationChannel);
        for (const userid of spotifyBuddies) {
            if (userid === currentUserId) continue;
            const member = await guild.members.fetch(userid);
            const message = createInviteMessage(inviteLink, currentUserId, spotifyBuddies, notificationChannel, serverInfo);
            await member.user.send(message);
        }

        const message = await createInitialNotification(spotifyBuddies[0], playlistId);
        if (messageType === "tc") {
            await channel.send(message);
        } else {
            const member = await guild.members.fetch(spotifyBuddies[0]);
            await member.user.send(message);
        }

        return response.json({ "message": "Playlist added" });
    } catch (error) {
        console.log(error);
        return response.json({ "error": `Something went wrong trying to add playlist, ${error}` })
    }
}

async function createInitialNotification(userId, playlistId) {
    const embedBuilder = new EmbedBuilder()
        .setColor("#3BE477")
        .setTitle("New Alert!")
        .setDescription(`To start things off, <@${userId}> add a song!`)
        .setThumbnail("https://i.imgur.com/A5y5wse.png")
        .setAuthor({
            name: `Spotify Buddy Alert System`,
            iconURL: "https://i.imgur.com/98RyXhh.png",
        });
    const playlistLink = new ButtonBuilder()
        .setLabel("Add a song!")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://open.spotify.com/playlist/${playlistId}`)

    const row = new ActionRowBuilder().addComponents(playlistLink);
    return { embeds: [embedBuilder], components: [row] };
}

async function getPlaylistData(playlistId) {
    //new instance of spotifywebapi
    const spotifyApi = new SpotifyWebAPI({
        clientId: process.env.SPOTIFY_API_ID,
        clientSecret: process.env.SPOTIFY_API_SECRET,
    });

    try {
        //authenticate
        const authData = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(authData.body.access_token);
        console.log("Spotify API authenticated successfully");
    } catch (error) {
        console.error("Error authenticating Spotify API:", error);
        return { success: false, error: "Failed to authenticate with Spotify API" };
    }

    try {
        const data = await spotifyApi.getPlaylist(playlistId);
        return data.body;
    } catch (error) {
        console.error("Something went wrong fetching playlist data", error);
        return null;
    }

    // let playlistSnapshot;
    // try {
    //     //get snapshot of playlist via id
    //     const playlistData = await spotifyApi.getPlaylist(playlistId, { fields: "snapshot_id" });
    //     playlistSnapshot = playlistData.body.snapshot_id;
    //     console.log("Playlist snapshot acquired");
    //     return { success: true, snapshot: playlistSnapshot };
    // } catch (error) {
    //     console.error("Error fetching playlist snapshot:", error);
    //     return { success: false, error: "Failed to fetch playlist snapshot" };
    // }
}

function createInviteMessage(inviteLink, currentUserId, spotifyBuddies, notificationChannel, serverInfo) {
    const buddieList = spotifyBuddies.map((id) => `<@${id}>`).join("\n")
    let notificationType
    if (notificationChannel) {
        notificationType = `<#${notificationChannel}>`
    } else { notificationType = "Direct Message" }
    const embedBuilder = new EmbedBuilder()
        .setColor("#3BE477")
        .setTitle("Invitation to be a buddy!")
        .setDescription(`
            You have been invited to collaborate in a spotify playlist by <@${currentUserId}> in the server ${serverInfo.guildData.name}\n
            **Users in the playlist:**\n
            ${buddieList}\n
            Be ready to add a song! You will be notified by me via ${notificationType}`)
        .setThumbnail("https://i.imgur.com/A5y5wse.png")
        .setAuthor({
            name: `Spotify Buddy Alert System`,
            iconURL: "https://i.imgur.com/98RyXhh.png",
        });
    const playlistLink = new ButtonBuilder()
        .setLabel("View Playlist")
        .setStyle(ButtonStyle.Link)
        .setURL(inviteLink)

    const row = new ActionRowBuilder().addComponents(playlistLink);
    return { embeds: [embedBuilder], components: [row] };
}

async function saveToConfigFile(data, serverId) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    let filePath;
    try {
        filePath = path.join(__dirname, `../../../../../ds_bot/model/spotifyNoti/serverConfigs.json`);
    } catch (error) {
        return { success: false, error: "Configuration file not found" };
    }

    let existingData = [];
    try {
        if (await fs.pathExists(filePath)) {
            const fileContent = await fs.readFile(filePath, "utf-8");
            existingData = JSON.parse(fileContent);
        }
        const playlistExists = existingData.serverConfigs.some(serverConfig =>
            serverConfig.playlists.some(pl => pl.playlistId === data.playlistId)
        );
        if (playlistExists) {
            //get playlist with matching id
            const serverConfig = existingData.serverConfigs.find(serverConfig => serverConfig.playlists.some(pl => pl.playlistId === data.playlistId));
            const playlist = serverConfig.playlists.find(pl => pl.playlistId === data.playlistId);
            //verify same user is trying to make change same as original
            if (playlist.createdBy === data.createdBy) {
                //get playlist index 
                const playlistIndex = serverConfig.playlists.findIndex(pl => pl.playlistId === data.playlistId);
                //use playlist index to change object 
                if (playlistIndex !== -1) {
                    serverConfig.playlists[playlistIndex] = data;
                }
                //save new data to file
                await fs.writeJson(filePath, existingData, { spaces: 2 });
                return { success: true, message: "Playlist edited!" }
            } else {
                return { success: false, error: "This playlist is already in use" };
            }
        }

        let serverConfig = existingData.serverConfigs.find(config => config.serverId === serverId);
        if (!serverConfig) {
            const serverConfig = {
                serverId: serverId,
                playlists: [data]
            }
            existingData.serverConfigs.push(serverConfig);
        } else {
            serverConfig.playlists.push(data);
        }

        await fs.writeJson(filePath, existingData, { spaces: 2 });
        return { success: true, message: "Playlist saved to config file" };
    } catch (error) {
        return { success: false, error: `Something went wrong saving the playlist ${error}` };
    }
}