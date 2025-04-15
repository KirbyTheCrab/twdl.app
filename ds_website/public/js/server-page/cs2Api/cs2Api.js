import Tracker from "../../tracker.js";
import { showLoadingScreen, hideLoadingScreen } from "../../loadingScreen.js";
import PopUpMessage from "../../popUpMessageFactory.js";
export default class Cs2Api {
  steamUser;
  isUserMod;
  cs2Tracker;
  steamAuthUser;
  steamUserCs2Inventory;
  itemRarityOrder;
  isTradeLinkConfigured;
  isCs2ItemSharingConfigured;
  isShareWithFriendsConfigured;
  constructor() {
    new Tracker("cs2Tracker");
    this.itemRarityOrder = [
      "Extraordinary",
      "Covert",
      "Classified",
      "Restricted",
      "Remarkable",
      "High Grade",
      "Mil-Spec Grade",
      "Industrial Grade",
      "Consumer Grade",
      "Base Grade",
    ];
    this.init();
  }
  async init() {
    await this.fetchUserStatus();
    await this.steamAuth();
    showLoadingScreen();
    this.isTradeLinkConfigured = await this.getIsTradeLinkConfigured();
    this.isShareWithFriendsConfigured =
      await this.getIsShareWithFriendsConfigured();
    this.isCs2ItemSharingConfigured =
      await this.getIsCs2ItemSharingChannelConfigured();
    await this.shareConfig(
      "profileSharingChannel",
      "#channel",
      "shareWithFriendsChannel"
    );
    await this.shareConfig(
      "tradeLinkSharingChannel",
      ".tradeLinkChannel",
      "tradeLinkChannel"
    );
    await this.shareConfig(
      "cs2ItemSharingChannel",
      ".itemShareChannel",
      "itemShareChannel"
    );
    await this.setupChannelEditing(
      this.isShareWithFriendsConfigured,
      "profileSharingChannel",
      "profileSetChannelBtn",
      "#channel"
    );
    await this.setupChannelEditing(
      this.isTradeLinkConfigured,
      "tradeLinkSharingChannel",
      "tradeLinkChannelBtn",
      ".tradeLinkChannel"
    );
    await this.setupChannelEditing(
      this.isCs2ItemSharingConfigured,
      "cs2ItemSharingChannel",
      "cs2ItemChannelBtn",
      ".itemShareChannel"
    );
    if (this.steamUser.steamAuthUser) {
      await this.shareWithFriendsForm(
        this.steamUser.steamAuthUser._json.steamid,
        this.isShareWithFriendsConfigured
      );

      await this.shareTradeLinkForm(
        this.steamUser.steamAuthUser._json.steamid,
        this.isTradeLinkConfigured
      );
      await this.createItemDisplay(this.steamUserCs2Inventory.descriptions);

      await this.filterCs2Items();
    }
    hideLoadingScreen();
  }
  async steamAuth() {
    const pathParts = window.location.pathname.split("/");
    const serverId = pathParts[2];
    const steamConn = document.getElementById("apiAuth");
    if (steamConn) {
      steamConn.action = `/server/${serverId}/auth/steam`;
    }
  }
  async filterCs2Items() {
    const data = this.steamUserCs2Inventory;
    document
      .getElementById("filter-cs2-items")
      .addEventListener("change", (event) => {
        // const filterValue = event.target.value;
        const sortedDescriptions = this.sortByRarity(data.descriptions);
        this.createItemDisplay(sortedDescriptions);
      });
  }
  sortByRarity(descriptions) {
    return descriptions.sort((a, b) => {
      // Get the rarity tag from the tags array
      const getRarityTag = (item) =>
        item.tags.find((tag) => tag.category === "Rarity")
          ?.localized_tag_name || "";

      const rarityA = getRarityTag(a);
      const rarityB = getRarityTag(b);

      const indexA = this.itemRarityOrder.indexOf(rarityA);
      const indexB = this.itemRarityOrder.indexOf(rarityB);

      return (
        (indexA === -1 ? Infinity : indexA) -
        (indexB === -1 ? Infinity : indexB)
      );
    });
  }
  async shareWithFriendsForm(steamid, channelId) {
    const shareLink = document.getElementById("shareLink");
    shareLink.value = `https://steamcommunity.com/profiles/${steamid}/`;
    shareLink.style.display = "none";
    document
      .getElementById("shareWithFriends")
      .addEventListener("submit", async function (event) {
        event.preventDefault();
        const shareLink = document.getElementById("shareLink").value;
        await fetch("/discord-data/tracker/steam/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shareLink,
            channelId,
          }),
        })
          .then((response) => response.json())
          .then((response) => {
            new PopUpMessage(
              response.message || response.error,
              response.message ? "ok" : "error"
            );
          });
      });
  }
  async shareTradeLinkForm(steamid, channelId) {
    const shareLinkDoc = document.createElement("a");
    const shareTradeLinkDiv = document.getElementById("shareTradeLinkDiv");

    shareLinkDoc.href = `https://steamcommunity.com/profiles/${steamid}/tradeoffers/privacy`;
    shareLinkDoc.textContent = "View your trade link here";
    shareLinkDoc.classList.add("api-list");
    shareTradeLinkDiv.appendChild(shareLinkDoc);

    document
      .getElementById("shareTradeLink")
      .addEventListener("submit", async (event) => {
        event.preventDefault();
        const tradeLink = document.getElementById("tradeLink").value;
        await fetch("/discord-data/tracker/steam/tradeLink", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tradeLink,
            channelId,
          }),
        })
          .then((response) => response.json())
          .then((response) => {
            new PopUpMessage(
              response.message || response.error,
              response.message ? "ok" : "error"
            );
          });
      });
  }
  async createItemDisplay(data) {
    const inventoryDiv = document.getElementById("inventory");
    inventoryDiv.innerHTML = "";
    for (let i = 0; i < data.length; i++) {
      const itemName = data[i].market_name;
      const itemType = data[i].type;
      const itemIconStr = data[i].icon_url;
      let inspectInGame;
      if (data[i].actions) {
        inspectInGame = data[i].actions[0]?.link;
      }

      let itemColor = "";
      for (let j = 0; j < data[i].tags.length; j++) {
        if (data[i].tags[j].category === "Rarity") {
          itemColor = data[i].tags[j].color;
          break;
        }
      }
      const itemIcon = `https://steamcommunity-a.akamaihd.net/economy/image/${itemIconStr}`;

      // Create item container
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("item");

      // Create child elements
      const itemImg = document.createElement("img");
      itemImg.src = itemIcon;

      const itemNameElement = document.createElement("p");
      itemNameElement.textContent = itemName;

      const itemTypeElement = document.createElement("p");
      itemTypeElement.textContent = itemType;

      const shareItemForm = document.createElement("form");
      const shareItemBtn = document.createElement("input");
      shareItemBtn.type = "submit";
      shareItemBtn.value = "Share Item";

      //add event listener
      shareItemForm.append(shareItemBtn);
      itemDiv.append(itemImg, itemNameElement, itemTypeElement, shareItemForm);
      itemDiv.style.backgroundColor = `#${itemColor}`;
      inventoryDiv.appendChild(itemDiv);

      const itemData = { itemName, itemColor, itemIconStr, inspectInGame };
      await this.shareItem(shareItemForm, itemData);
    }
  }
  async shareItem(form, itemData) {
    const channelId = this.isCs2ItemSharingConfigured;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await fetch("/discord-data//tracker/steam/shareItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, itemData }),
      })
        .then((response) => response.json())
        .then((response) => {
          new PopUpMessage(
            response.message || response.error,
            response.message ? "ok" : "error"
          );
        });
    });
  }
  async setupChannelEditing(configuredValue, formId, buttonId, selectClass) {
    let isBeingEdited = false;
    if (typeof configuredValue !== "string") return;

    const form = document.getElementById(formId);
    const editBtn = document.getElementById(buttonId);
    const channelSelect = document.querySelector(selectClass);

    if (!form || !editBtn || !channelSelect) return;

    editBtn.value = "Edit";
    channelSelect.value = configuredValue;
    channelSelect.disabled = true;

    editBtn.addEventListener("click", (event) => {
      if (!isBeingEdited) {
        event.preventDefault();
        isBeingEdited = true;
        channelSelect.disabled = false;
        editBtn.value = "Save";
        const cancelBtn = document.createElement("input");
        cancelBtn.type = "button";
        cancelBtn.value = "Cancel";
        form.appendChild(cancelBtn);
        cancelBtn.addEventListener("click", () => {
          channelSelect.value = configuredValue;
          channelSelect.disabled = true;
          isBeingEdited = false;
          editBtn.value = "Edit";
          form.removeChild(cancelBtn);
        });
      }
    });
  }
  async shareConfig(formId, inputSelector, channelKey) {
    const form = document.getElementById(formId);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const channel = document.querySelector(inputSelector).value;
      await fetch("/discord-data/tracker/steam/steamSharingConfiguration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, channelKey }),
      })
        .then((response) => response.json())
        .then((response) => {
          new PopUpMessage(
            response.message || response.error,
            response.message ? "ok" : "error"
          );
          location.reload();
        });
    });
  }
  //getters
  async fetchCs2Items(steamid, appid = 730, contextid = 2) {
    return await fetch(
      `/discord-data/api/steam/inventory?steamid=${steamid}&appid=${appid}&contextid=${contextid}`
    )
      .then((response) => response.json())
      .then((data) => data);
  }
  async fetchUserStatus() {
    [this.steamUser, this.isMod] = await Promise.all([
      fetch("/session/steamAuthUser").then((res) => res.json()),
      fetch("/session/isMod").then((res) => res.json()),
    ]);
    if (this.steamUser.steamAuthUser) {
      this.steamUserCs2Inventory = await this.fetchCs2Items(
        this.steamUser.steamAuthUser._json.steamid
      );
    }
  }
  async getIsTradeLinkConfigured() {
    return await fetch(
      "/discord-data/guild/tracker/steam/isTradeLinkConfigured"
    )
      .then((res) => res.json())
      .then((data) => data);
  }
  async getIsShareWithFriendsConfigured() {
    return await fetch(
      "/discord-data/guild/tracker/steam/isShareWithFriendsConfigured"
    )
      .then((res) => res.json())
      .then((data) => data);
  }
  async getIsCs2ItemSharingChannelConfigured() {
    return await fetch(
      "/discord-data/guild/tracker/steam/isCs2ItemSharingConfigured"
    )
      .then((res) => res.json())
      .then((data) => data);
  }
}
