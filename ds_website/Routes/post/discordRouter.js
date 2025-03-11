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
import cs2Init from "../../Controller/post/client/steamAPI/init.js";
import removeDiscordMessage from "../../Controller/post/client/removeDiscordMessage.js";
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

  //R6 Tracker Network
  .post("/r6Tracker/initR6Tracker", r6Init)
  .post("/r6Tracker/isUserRegistered", isUserRegistered)
  .post("/r6Tracker/saveUser", saveUser)

  //CS2 Tracker
  .post("/cs2Tracker/init", cs2Init);

export default discordRoute_POST;
