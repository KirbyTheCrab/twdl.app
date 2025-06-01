import express from "express";
import changeClientNickName from "../../Controller/post/client/changeNickName.js";
import kickClient from "../../Controller/post/client/kickClient.js";
import changeGuildName from "../../Controller/post/guild/changeGuildName.js";
import changeGuildIcon from "../../Controller/post/guild/changeGuildIcon.js";
import createEmbedReaction from "../../Controller/post/client/createEmbed.js";
import welcomeMessage from "../../Controller/post/client/welcomeMessage.js";
import saveRoleReactionFile from "../../Controller/post/client/saveRoleReactionFile.js";
import getDataFromJsonFiles from "../../Controller/post/client/getDataFromJsonFiles.js";
import isUserRegistered from "../../Controller/post/client/r6Tracker/isUserRegistered.js";
import saveUser from "../../Controller/post/client/r6Tracker/saveUser.js";
import r6Init from "../../Controller/post/client/r6Tracker/init.js";
import removeDiscordMessage from "../../Controller/post/client/removeDiscordMessage.js";
import shareWithFriends from "../../Controller/post/client/steamAPI/shareWithFriends.js";
import shareTradeLink from "../../Controller/post/client/steamAPI/shareTradeLink.js";
import isEnabled from "../../Controller/post/client/r6Tracker/isEnabled.js";
import shareItem from "../../Controller/post/client/steamAPI/shareItem.js";
import steamSharingConfiguration from "../../Controller/post/client/steamAPI/steamSharingConfiguration.js";
import addSpotifyBuddies from "../../Controller/post/client/spotify-noti/addBuddies.js";
import getChannelInfo from "../../Controller/get/discord/get-channel-info.js";
import getUserInfo from "../../Controller/get/discord/get-user-info.js";
import removePlaylist from "../../Controller/post/client/spotify-noti/removePlaylist.js";
import editPlaylist from "../../Controller/post/client/spotify-noti/editPlaylist.js";
import itemPricing from "../../Controller/post/client/steamAPI/itemPricing.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });
const discordRoute_POST = express.Router();

//prefix:(/discord-data/)
discordRoute_POST
  .post("/setClientNickname", changeClientNickName)
  .post("/setGuildIcon", upload.single("image"), changeGuildIcon)
  .post("/setGuildName", changeGuildName)
  .post("/kickClient", kickClient)
  .post("/createEmbed", createEmbedReaction)
  .post("/welcomeMessage", welcomeMessage)
  .post("/saveRoleReactionFile", saveRoleReactionFile)
  .post("/getDataFromJsonFiles", getDataFromJsonFiles)
  .post("/deleteDiscordMessage", removeDiscordMessage)

  .post("/guild/channel-data", getChannelInfo)
  .post("/guild/user-data", getUserInfo)

  //Tracker Network
  .post("/tracker/initTracker", r6Init)
  .post("/tracker/isUserRegistered", isUserRegistered)
  .post("/tracker/saveUser", saveUser)
  .post("/tracker/steam/share", shareWithFriends)
  .post("/tracker/steam/tradeLink", shareTradeLink)
  .post("/guild/tracker/isEnabled", isEnabled)
  .post("/tracker/steam/shareItem", shareItem)
  .post("/tracker/steam/steamSharingConfiguration", steamSharingConfiguration)
  .post("/tracker/steam/itemPricing", itemPricing)

  //spotify routes
  .post("/spotify/buddies-list/add", addSpotifyBuddies)
  .post("/spotify/playlist/remove", removePlaylist)
  .post("/spotify/playlist/edit", editPlaylist)

export default discordRoute_POST;
