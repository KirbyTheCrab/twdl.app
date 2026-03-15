import isUserMod from "./isUserMod.js";
import getClientServerList from "./isBotInServer.js";
import { hideLoadingScreen, showLoadingScreen } from "../../loadingScreen.js";
export default class ServerData {
  listOfServerIds = [];
  async fetchServerData(tokenType, accessToken, user) {
    showLoadingScreen();
    try {
      const userId = user.getUserId();
      const mainContent = document.getElementById("main-content");
      const response = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: {
          authorization: `${tokenType} ${accessToken}`,
        },
      }).then((result) => result.json());

      const clientServerList = await getClientServerList();
      const serverElements = await Promise.all(
        response.map((serverData) =>
          this.createServerCard(serverData, userId, clientServerList)
        )
      );
      hideLoadingScreen();
      // Append all server elements to the main content
      serverElements.forEach((serverCard) =>
        mainContent.appendChild(serverCard)
      );
    } catch (error) {
      console.error(
        "Something went wrong trying to create server cards " + error
      );
    }
  }

  async createServerCard(serverData, userId, clientServerList) {
    this.setListOfServerIds(serverData.id);
    const serverCard = document.createElement("div");
    serverCard.classList.add("server-card", serverData.id);
    const staggerDelay = Math.min(this.listOfServerIds.length * 55, 550);
    serverCard.style.setProperty("--stagger", `${staggerDelay}ms`);
    const serverPermissions = await this.userPermissions(
      serverData,
      userId,
      clientServerList,
      serverCard
    );
    const serverIcon = this.setServerIcon(serverData);
    const serverName = this.setServerName(serverData);

    serverCard.append(serverIcon, serverName, serverPermissions);
    return serverCard;
  }

  async userPermissions(serverData, userId, clientServerList, serverCard) {
    const isMod = await isUserMod(userId, serverData.id);
    const isOwner = serverData.owner;
    const permissions = serverData.permissions;
    let isAdmin = false;
    if (permissions === 2147483647) {
      isAdmin = true;
    }
    const serverAnchor = document.createElement("a");
    serverCard.appendChild(
      this.createUserPermissionImg(isMod, isOwner, isAdmin, serverCard)
    );

    // If the user has permissions and the bot is in the server
    if (clientServerList.includes(serverData.id) && (isMod || isOwner)) {
      serverCard.style.order = "1";
      serverAnchor.href = `/server/${serverData.id}`;
      serverAnchor.textContent = "Configure";
      serverAnchor.classList.add("server-a");
      return serverAnchor;
    }

    if (!clientServerList.includes(serverData.id) && (isAdmin || isOwner)) {
      serverAnchor.href =
        "https://discord.com/oauth2/authorize?client_id=1089904140685164686&scope=bot&permissions=1099511627775";
      serverAnchor.textContent = "Invite Bot";
      serverCard.style.order = "2";
      serverAnchor.classList.add("server-a");
      return serverAnchor;
    } else {
      serverAnchor.href = `/server/${serverData.id}`;

      //if server has cs2, r6 or wow enabled enable certain view ?isMod=false
      const res = await this.getServerApisEnabled(serverData.id);
      if (res.cs2Tracker || res.r6Tracker || res.wowTracker) {
        serverAnchor.textContent = "View";
        serverCard.style.order = "3";
      } else {
        serverCard.style.pointerEvents = "none";
        serverCard.style.order = "4";
        serverCard.style.opacity = 0.2;
      }
      serverAnchor.classList.add("server-a");
      return serverAnchor;
    }
  }

  createUserPermissionImg(isMod, isOwner, isAdmin, serverCard) {
    const serverPermissions = document.createElement("img");
    serverCard.style.order = isOwner ? "3" : "4";
    if (isOwner) {
      serverPermissions.src = `/svg/crown-svgrepo-com.svg`;
      serverPermissions.classList.add("server-owner");
    } else if (isMod || isAdmin) {
      serverPermissions.src = "/img/Moderator_Badge.png";
    } else {
      serverPermissions.src = "/svg/team-member-svgrepo-com.svg";
    }
    serverPermissions.classList.add("server-perms");
    return serverPermissions;
  }

  setServerIcon(serverData) {
    const serverIcon = document.createElement("img");
    serverIcon.src = serverData.icon
      ? `https://cdn.discordapp.com/icons/${serverData.id}/${serverData.icon}.png`
      : `/img/discord-default-green.png`;
    serverIcon.classList.add("server-icon");
    return serverIcon;
  }

  setServerName(serverData) {
    const serverName = document.createElement("h2");
    serverName.innerText = serverData.name;
    serverName.classList.add("server-name");
    return serverName;
  }

  setListOfServerIds(serverId) {
    this.listOfServerIds.push(serverId);
  }

  getListOfServerIds() {
    return this.listOfServerIds;
  }

  async getServerApisEnabled(guildID) {
    const fetchTrackerStatus = async (gameTracker) => {
      const res = await fetch(`/discord-data/guild/tracker/isEnabled`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameTracker, guildID }),
      });
      const data = await res.json();
      return data.isEnabled;
    };

    const cs2Tracker = await fetchTrackerStatus("cs2Tracker");
    const r6Tracker = await fetchTrackerStatus("r6Tracker");
    const wowTracker = await fetchTrackerStatus("wowTracker");

    return { cs2Tracker, r6Tracker, wowTracker };
  }
}
