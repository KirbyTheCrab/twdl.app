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
  userShareTradeLink;
  inventoryCache = new Map();
  constructor() {
    new Tracker("cs2Tracker");
    this.itemExteriorOrder = [
      "Factory New",
      "Minimal Wear",
      "Field-Tested",
      "Well-Worn",
      "Battle-Scarred"
    ]
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
    this.itemTypeOrder = [
      "Rifle",
      "Sniper Rifle",
      "Pistol",
      "SMG",
      "Shotgun",
      "Machine Guns"
    ]
    this.init();
  }
  async init() {
    showLoadingScreen();
    try {
      await this.fetchUserStatus();
      await this.steamAuth();
    } catch (error) {
      console.error(error);
    }
    try {
      this.userShareTradeLink = await this.didUserShareTradeLink();
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
      if (this.isTradeLinkConfigured.error || this.isCs2ItemSharingConfigured.error || this.isShareWithFriendsConfigured.error) {
        const initTrackerDiv = document.getElementById("initTrackerDiv");
        const mainBody = document.getElementById("main");
        if (initTrackerDiv) {
          initTrackerDiv.remove();
        }
        if (mainBody) {
          mainBody.remove();
        }
      }
      if (this.steamUser.steamAuthUser) {
        await this.shareWithFriendsForm(
          this.steamUser.steamAuthUser._json.steamid,
          this.isShareWithFriendsConfigured
        );

        await this.shareTradeLinkForm(
          this.steamUser.steamAuthUser._json.steamid,
          this.isTradeLinkConfigured
        );
        if (!this.userShareTradeLink) {
          const cs2InventoryHeader = document.getElementById("cs2-inventory-header");
          cs2InventoryHeader.remove();
        } else if (this.steamUserCs2Inventory && Array.isArray(this.steamUserCs2Inventory.descriptions)) {
          await this.createItemDisplay(this.steamUserCs2Inventory.descriptions);
          await this.filterCs2Items();
        }
      }
    } finally {
      hideLoadingScreen();
    }
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
    document
      .getElementById("filter-cs2-items")
      .addEventListener("change", (event) => {
        const filterValue = event.target.value;
        let sortedDescriptions;
        switch (filterValue) {
          case "Rarity": {
            sortedDescriptions = this.sortByRarity(this.steamUserCs2Inventory.descriptions, filterValue, this.itemRarityOrder);
            break;
          }
          case "Exterior": {
            sortedDescriptions = this.sortByRarity(this.steamUserCs2Inventory.descriptions, filterValue, this.itemExteriorOrder);
            break;
          }
          case "Type": {
            sortedDescriptions = this.sortByRarity(this.steamUserCs2Inventory.descriptions, filterValue, this.itemTypeOrder);
            break;
          }
        }
        sortedDescriptions.sort();
        this.createItemDisplay(sortedDescriptions);
      });
  }
  sortByRarity(list, filter, listToFilterBy) {
    return list.sort((a, b) => {
      // Get the rarity tag from the tags array
      const getRarityTag = (item) =>
        item.tags.find((tag) => tag.category === `${filter}`)
          ?.localized_tag_name || "";

      const rarityA = getRarityTag(a);
      const rarityB = getRarityTag(b);

      const indexA = listToFilterBy.indexOf(rarityA);
      const indexB = listToFilterBy.indexOf(rarityB);

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

  async didUserShareTradeLink() {
    const response = await fetch("/discord-data/tracker/steam/didUserShareTradeLink");
    const data = await response.json();
    if (data.userProfile) {
      return data.userProfile.tradeLink;
    }
  }
  async shareTradeLinkForm(steamid, channelId) {
    const shareLinkDoc = document.createElement("a");
    const shareTradeLinkDiv = document.getElementById("shareTradeLinkDiv");
    const tradeLink = document.getElementById("tradeLink");
    if (this.userShareTradeLink) {
      tradeLink.value = this.userShareTradeLink;
    }
    shareLinkDoc.href = `https://steamcommunity.com/profiles/${steamid}/tradeoffers/privacy`;
    shareLinkDoc.textContent = "View your trade link here";
    shareLinkDoc.classList.add("api-list");
    shareTradeLinkDiv.appendChild(shareLinkDoc);

    document
      .getElementById("shareTradeLink")
      .addEventListener("submit", async (event) => {
        event.preventDefault();
        const tradeLinkValue = tradeLink.value;
        await fetch("/discord-data/tracker/steam/tradeLink", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tradeLinkValue,
            channelId,
          }),
        })
          .then((response) => response.json())
          .then((response) => {
            new PopUpMessage(
              response.message || response.error,
              response.message ? "ok" : "error"
            );
            setTimeout(() => {
              location.reload();
            }, 500);
          });
      });
  }
  async getAssetInfo(classid, instanceid) {
    return this.steamUserCs2Inventory.assets.find(
      asset => asset.classid === classid && asset.instanceid === instanceid
    ) || null;
  }
  async createItemDisplay(data) {
    const itemsPerPage = 16; // Number of items per page
    let currentPage = 1; // Current page

    const inventoryDiv = document.getElementById("inventory");
    const paginationDiv = document.getElementById("pagination"); // Add a container for pagination controls

    // Function to render items for the current page
    const renderPage = async () => {
      inventoryDiv.innerHTML = "";
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageItems = data.slice(startIndex, endIndex);

      for (let i = 0; i < pageItems.length; i++) {
        const itemName = pageItems[i].market_name;
        const itemType = pageItems[i].type;
        const itemIconStr = pageItems[i].icon_url;
        const classid = pageItems[i].classid;
        const instanceid = pageItems[i].instanceid;
        const assetId = pageItems[i].assetId;
        const marketHashName = pageItems[i].market_hash_name;
        const assetInfo = await this.getAssetInfo(classid, instanceid);

        let inspectInGame;
        let inspectInGameLink;
        if (pageItems[i].actions) {
          inspectInGame = pageItems[i].actions[0]?.link;
          inspectInGameLink = inspectInGame
            .replace('%owner_steamid%', this.steamUser.steamAuthUser.id)
            .replace('%assetid%', assetInfo.assetid);
        }

        let itemColor = "";
        for (let j = 0; j < pageItems[i].tags.length; j++) {
          if (pageItems[i].tags[j].category === "Rarity") {
            itemColor = pageItems[i].tags[j].color;
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

        // Add event listener
        shareItemForm.append(shareItemBtn);
        itemDiv.append(itemImg, itemNameElement, itemTypeElement, shareItemForm);
        itemDiv.style.backgroundColor = `#${itemColor}`;
        inventoryDiv.appendChild(itemDiv);
        const itemData = { itemName, itemColor, itemIconStr, inspectInGameLink, marketHashName, assetId };
        await this.shareItem(shareItemForm, itemData);
      }
    };

    // Function to render pagination controls
    const renderPagination = () => {
      paginationDiv.innerHTML = "";
      const totalPages = Math.ceil(data.length / itemsPerPage);

      for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.classList.add("pagination-button");
        if (i === currentPage) {
          pageButton.classList.add("active");
        }
        pageButton.addEventListener("click", () => {
          currentPage = i;
          renderPage();
          renderPagination();
        });
        paginationDiv.appendChild(pageButton);
      }
    };
    // Initial render
    renderPage();
    renderPagination();
  }
  async shareItem(form, itemData) {
    const channelId = this.isCs2ItemSharingConfigured;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const itemPrice = await this.getItemPricing(itemData.marketHashName);
      itemData.itemPrice = itemPrice.median_price;
      itemData.tradeLink = this.userShareTradeLink;

      await fetch("/discord-data/tracker/steam/shareItem", {
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
  /**
   * Create edit forms for further settings options (profile sharing channel, cs2 trade link channel, cs2 item sharing channel)
   * @param {*} configuredValue 
   * @param {*} formId 
   * @param {*} buttonId 
   * @param {*} selectClass 
   * @returns 
   */
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

  /**
   * Create form for further configuration options (profile sharing channel, cs2 trade link channel, cs2 item sharing channel)
   * @param {#} formId 
   * @param {*} inputSelector 
   * @param {*} channelKey 
   */
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
    const cacheKey = `${steamid}-${appid}-${contextid}`;

    if (this.inventoryCache.has(cacheKey)) {
      return this.inventoryCache.get(cacheKey);
    }
    const response = await fetch(
      `/discord-data/api/steam/inventory?steamid=${steamid}&appid=${appid}&contextid=${contextid}`);

    if (!response.ok) {
      new PopUpMessage("Failed to fetch inventory. Your inventory might be private.");
      return undefined;
    }
    const data = await response.json();
    if (!data) {
      new PopUpMessage("No inventory found. Please make sure your Steam inventory is public.", "error");
      return undefined;
    }

    this.inventoryCache.set(cacheKey, data);
    setTimeout(() => this.inventoryCache.delete(cacheKey), 3600 * 1000);

    return data;
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

  //come back to providing a price for items not sure how this will work or if it will work at all
  async getItemPricing(marketHashName) {
    const response = await fetch("/discord-data/tracker/steam/itemPricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marketHashName })
    })
    const data = await response.json();
    return data;
  }
}
