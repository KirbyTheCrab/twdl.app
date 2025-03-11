import { showLoadingScreen, hideLoadingScreen } from "../../loadingScreen.js";

export default class ServerInfoPage {
  async serverStats() {
    showLoadingScreen();
    this.filterSearch("#role-list", "role-search");
    this.filterSearch("#user-list", "user-search");
    const mainContent = document.getElementById("server-stats");
    await this.fecthServerData();
    const serverInfoElements = await this.createServerInfo(this.guildData);
    mainContent.appendChild(serverInfoElements);
    hideLoadingScreen();
  }

  async createServerInfo(guildData) {
    const serverInfo = document.createElement("div");
    const serverNameElement = await this.setServerInfo(guildData.name);
    const serverUserCountElement = await this.setServerInfo(
      `Member Count: ${guildData.members.length}`
    );
    const serverIconElement = await this.setServerIcon(guildData.icon);
    await this.listUsers(guildData.members);
    await this.listRoles("role-list");
    const roleCountElement = await this.setServerInfo(
      `Role Count: ${guildData.roles.length}`
    );
    serverInfo.append(
      serverIconElement,
      serverNameElement,
      serverUserCountElement,
      roleCountElement
    );
    return serverInfo;
  }

  async listUsers(serverUserList) {
    let userListElement;
    let actionOptionList;

    const userInfoUl = document.getElementById("user-list");
    serverUserList.sort();
    for (let userid of serverUserList) {
      const user = await this.fetchUser(userid);
      //create elements
      userListElement = document.createElement("li");
      actionOptionList = document.createElement("select");

      userListElement.addEventListener(
        "click",
        this.showActionButtons(actionOptionList)
      );
      userListElement.textContent = `${user.displayName}`;
      //class lists
      userListElement.classList.add("user-list-li");
      userInfoUl.append(userListElement);
    }
  }

  async listRoles(elementId) {
    let roleList;
    const roleListUl = document.getElementById(elementId);
    this.serverRoleList.sort();
    for (let roleid of this.serverRoleList) {
      const role = await this.fetchRole(roleid);
      roleList = document.createElement("li");
      roleList.textContent = `${role.name}`;
      if (role.color === 0) {
        roleList.style.color = "black";
        roleList.style.backgroundColor = "#0092ca";
      } else {
        const colorHex = this.changeColorNoToHex(role.color);
        roleList.style.backgroundColor = colorHex;
        roleList.style.color = "black";
      }
      roleList.classList.add("role-list-li");
      roleListUl.append(roleList);
    }
  }

  /**
   * Fetch server data
   */
  async fecthServerData() {
    const response = await fetch("/discord-data/guild/guild-data");
    const responseJson = await response.json();
    this.guildData = responseJson.guildData;
    this.serverId = this.guildData.id;
    this.serverRoleList = this.guildData.roles;
  }

  /**
   * Fetch Role information
   * @param {string} roleid
   * @returns JSON Discord object containing role info e.g: color or id
   */
  async fetchRole(roleid) {
    const response = await fetch(
      `/discord-data/guild/role-data?guildId=${this.serverId}&roleId=${roleid}`
    );
    const responseJson = await response.json();
    return responseJson.role;
  }

  /**
   * Fetch User information
   * @param {string} userid
   * @returns JSON Discord object containing user info e.g: id or display name
   */
  async fetchUser(userid) {
    const response = await fetch(
      `/discord-data/guild/user-data?serverid=${this.serverId}&userid=${userid}`
    );
    const responseJson = await response.json();
    return responseJson.user;
  }

  /**
   * Create server icon HTML image
   * @param {string} serverIconId
   * @returns HTML image object to append to document
   */
  async setServerIcon(serverIconId) {
    const serverIcon = document.createElement("img");
    serverIcon.src = serverIconId
      ? `https://cdn.discordapp.com/icons/${this.serverId}/${serverIconId}.png`
      : `/img/discord-default-green.png`;
    serverIcon.classList.add("server-icon");
    return serverIcon;
  }

  async setServerInfo(value) {
    const paragraph = document.createElement("p");
    paragraph.textContent = `${value}`;
    return paragraph;
  }

  changeColorNoToHex(colorNo) {
    return `#${colorNo.toString(16).padStart(6, "0")}`;
  }

  filterSearch(listItemsId, inputFieldId) {
    document
      .getElementById(`${inputFieldId}`)
      .addEventListener("input", function () {
        const filter = this.value.toLowerCase();
        const listItems = document.querySelectorAll(`${listItemsId} li`);
        listItems.forEach((element) => {
          const text = element.textContent.toLowerCase();
          if (text.includes(filter)) {
            element.style.display = "";
          } else {
            element.style.display = "none";
          }
        });
      });
  }

  showActionButtons(listItem) {
    const banIcon = document.createElement("option");
    const editIcon = document.createElement("option");
    const kickIcon = document.createElement("option");

    banIcon.src = "/svg/gavel-svgrepo-com.svg";
    editIcon.src = "/svg/pencil-square-svgrepo-com.svg";
    kickIcon.src =
      "/svg/boot-out-fire-kick-out-firing-an-employee-svgrepo-com.svg";

    banIcon.classList.add("user-action-btn");
    editIcon.classList.add("user-action-btn");
    kickIcon.classList.add("user-action-btn");
    return listItem.append(banIcon, editIcon, kickIcon);
  }
}
