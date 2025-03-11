import { guild, filepath, SpotifyAPI, Buddies } from "../json/config.json";
import { writeFile, truncate, readFile } from "node:fs";
//Guild Constants
const guild_spotifyTC_id_test = guild.spotfiy_text_channel_id_test;
const guild_spotifyTC_id_main = guild.spotfiy_text_channel_id_main;

//filepath Constants
const filepath_spotifyQueCount = filepath.spotfiyQueCount;

//Spotify API Constants
const spotifyAPI_webhook = guild.webhook;
const spotifyAPI_id = SpotifyAPI.id;
const spotifyAPI_secret = SpotifyAPI.secret;
const spotfiyAPI_playlist_id = SpotifyAPI.playlistId_test;
import SpotifyWebAPI from "spotify-web-api-node";
const spotifyApi = new SpotifyWebAPI({
  clientId: spotifyAPI_id,
  clientSecret: spotifyAPI_secret,
});
let currentSnapshotId = null;

//Buddies Constants
const buddie_david = Buddies.David;
const buddie_matthew = Buddies.Matthew;
const buddie_scotty = Buddies.Scotty;
const buddie_soup = Buddies.Soup;
const buddie_bent = Buddies.Bent;
const buddie_lumberjack = Buddies.Lumberjack;

let position = getQueueID();
const spotifyList = [
  buddie_david, //David 1
  buddie_matthew, //Matthew 2
  buddie_scotty, //Scotty 3
  buddie_soup, //Soup 4
  buddie_bent, //bent 5
  buddie_lumberjack, //Lumberjack 6
  buddie_david, //David
];

//spotifyApiAuth
async function authenticate() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body.access_token);
    console.log("Successfully authenticated Spotify API")
  } catch (error) {
    console.log("Error at authentication for spotify api "+ error);
  }
}

// Get the current snapshot ID of the playlist
async function getSnapshotId() {
  const data = await spotifyApi.getPlaylist(spotfiyAPI_playlist_id, {
    fields: "snapshot_id",
  });
  return data.body.snapshot_id;
}

// Send a message to Discord
async function sendDiscordMessage(message) {
  const data = { content: message };
  await fetch(spotifyAPI_webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  console.log(data);
}

// Continuously poll the playlist for changes
let nextInQueue;
async function pollPlaylist(client) {
  try {
    if (!spotifyApi.getAccessToken()) {
      await authenticate();
    }
    const snapshotId = await getSnapshotId();
    if (!currentSnapshotId) {
      currentSnapshotId = snapshotId;
    } else if (snapshotId !== currentSnapshotId) {
      position++;
      savePlaylistQueue(position);
      nextInQueue = spotifyList[position];
      let message =
        "A new song has been added to the playlist! \n" +
        `<@${nextInQueue}>` +
        " Your turn";
        await deleteAllmessages(guild_spotifyTC_id_test,client);
        await sendDiscordMessage(message);
      if (position == 6) {
        position = 0;
      }
      currentSnapshotId = snapshotId;
      console.log("Someone added a song");
    }
  } catch (err) {
    spotifyApi.resetAccessToken();
  }
  setTimeout(pollPlaylist, 1000); // Wait for 1 minute before checking again
  //60000 - main
  //1000 - test
}

async function deleteAllmessages(channelId, client) {
  try {
    const textChannel = await client.channels.fetch(channelId);
    let channelMessages = await textChannel.messages.fetch();
    while (channelMessages.size > 0) {
      const messagesArray = channelMessages.array();
      await textChannel.bulkDelete(messagesArray);
      // Fetch the remaining messages for the next iteration
      channelMessages = await textChannel.messages.fetch();
    }

    console.log('All messages deleted successfully.');
  } catch (error) {
    console.error('Error deleting messages:', error);
  }
}

async function savePlaylistQueue(queueCount){
  const dataToWrite = queueCount;
  truncateFIle(filepath_spotifyQueCount);
  const dataToWriteStr = dataToWrite.toString();
  
  writeFile(filepath_spotifyQueCount, dataToWriteStr, (err) => {
    if (err) {
      console.error('Error writing to file:', err);
    } else {
      console.log('Variable successfully written to file!');
    }
  })
}

async function truncateFIle(filePath){
  truncate(filePath,0,(truncatErr)=>{
    if(truncatErr){
      console.log("Error turncating file "+truncatErr);
    }else{
      console.log("File Cleared");
    }
  })
}

async function getQueueID(){
    readFile(filepath_spotifyQueCount,(err,data)=>{
      if(err){
        console.log("Failed to retrieve data from file "+err);
      }else{
        position = data;
        console.log(data);
      }
    })
  }

export default {
    pollPlaylist,
    deleteAllmessages
};