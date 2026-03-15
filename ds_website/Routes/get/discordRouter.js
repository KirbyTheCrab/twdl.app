import express from "express";

import getGuildCount from "../../Controller/get/discord/guild-count.js";
import isUserMod from "../../Controller/get/discord/is-user-mod.js";
import getUserCount from "../../Controller/get/discord/user-count.js";
import getClientServers from "../../Controller/get/discord/get-client-servers.js";
import getGuildData from "../../Controller/get/guild/guild-data.js";
import getRoleInfo from "../../Controller/get/discord/get-role-info.js";
import getTextChannels from "../../Controller/get/discord/get-text-channels.js";
import getServerRoles from "../../Controller/get/discord/get-server-roles.js";
import disableWelcomeMsg from "../../Controller/post/client/disableWelcomeMsg.js";
import isUserRegistered from "../../Controller/post/client/r6Tracker/isUserRegistered.js";
import r6TrackerAPIConn from "../../Controller/post/client/r6Tracker/r6TrackerApiCon.js";
import getSteamUserInventory from "../../Controller/get/steam/get-inventory.js";
import isTradeLinkConfigured from "../../Controller/post/client/steamAPI/isTradeLinkConfigured.js";
import isShareWithFriendsConfigured from "../../Controller/post/client/steamAPI/isShareWithFriendsConfigured.js";
import isCs2ItemSharingConfigured from "../../Controller/post/client/steamAPI/isCs2ItemSharingConfigured.js";
import getServerPlaylists from "../../Controller/get/spotify/getPlaylists.js";
import didUserShareTradeLink from "../../Controller/post/client/steamAPI/didUserShareTradeLink.js";
import {
  requireAuth,
  requireServerSelection,
} from "../../middleware/discordAccess.js";
const discordRoute_GET = express.Router();
discordRoute_GET.use(requireAuth);

discordRoute_GET

  //client
  .get("/client/guild-count", getGuildCount)
  .get("/client/user-count", getUserCount)
  .get("/client/is-user-mod", isUserMod)
  .get("/client/servers", getClientServers)

  //guild
  .get("/guild/guild-data", requireServerSelection, getGuildData)
  .get("/guild/role-data", requireServerSelection, getRoleInfo)
  .get("/guild/text-channels", requireServerSelection, getTextChannels)
  .get("/guild/roles", requireServerSelection, getServerRoles)
  .get("/guild/disableWelcomeMsg", requireServerSelection, disableWelcomeMsg)
  .get("/spotify/playlists", requireServerSelection, getServerPlaylists)

  //Tracker Network
  .get("/guild/tracker/isUserRegistered", requireServerSelection, isUserRegistered)
  .get("/r6Tracker/apiConn", r6TrackerAPIConn)
  .get("/api/steam/inventory", requireServerSelection, getSteamUserInventory)
  .get("/guild/tracker/steam/isTradeLinkConfigured", isTradeLinkConfigured)
  .get("/tracker/steam/didUserShareTradeLink", didUserShareTradeLink)
  .get(
    "/guild/tracker/steam/isShareWithFriendsConfigured",
    isShareWithFriendsConfigured
  )
  .get(
    "/guild/tracker/steam/isCs2ItemSharingConfigured",
    isCs2ItemSharingConfigured
  );

export default discordRoute_GET;
