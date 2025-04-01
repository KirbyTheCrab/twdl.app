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
import shareWithFriendsConfig from "../../Controller/post/client/steamAPI/shareWithFriendsConfig.js";
import shareTradeLinkConfig from "../../Controller/post/client/steamAPI/shareTradeLinkConfig.js";
import shareItem from "../../Controller/post/client/steamAPI/shareItem.js";
import steamSharingConfiguration from "../../Controller/post/client/steamAPI/steamSharingConfiguration.js";
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

  //Tracker Network
  .post("/tracker/initTracker", r6Init)
  .post("/tracker/isUserRegistered", isUserRegistered)
  .post("/tracker/saveUser", saveUser)
  .post("/tracker/steam/share", shareWithFriends)
  .post("/tracker/steam/tradeLink", shareTradeLink)
  .post("/guild/tracker/isEnabled", isEnabled)
  .post("/tracker/steam/shareItem", shareItem)

  
  .post("/tracker/steam/steamSharingConfiguration", steamSharingConfiguration)

export default discordRoute_POST;
