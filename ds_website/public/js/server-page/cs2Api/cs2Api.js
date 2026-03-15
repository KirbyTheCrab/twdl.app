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
  itemPriceCache = new Map();
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
    ];
    this.originalItems = [];
    this.filteredItems = [];
    this.itemsPerPage = 16;
    this.currentPage = 1;
    this.currentFilters = {
      search: "",
      rarity: "all",
      exterior: "all",
      type: "all",
      sort: "name-asc",
      quality: "all",
    };
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
          this.originalItems = [...this.steamUserCs2Inventory.descriptions];
          this.filteredItems = [...this.originalItems];
          this.initializeInventoryControls();
          await this.applyInventoryFilters();
          await this.renderInventory();
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
  getTagValue(item, category) {
    if (!Array.isArray(item?.tags)) return "Unknown";
    return (
      item.tags.find((tag) => tag.category === category)?.localized_tag_name ||
      "Unknown"
    );
  }

  getCategoryValues(category) {
    const values = new Set();
    this.originalItems.forEach((item) => {
      const value = this.getTagValue(item, category);
      if (value && value !== "Unknown") values.add(value);
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }

  populateSelect(selectId, values, fallbackOption) {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = "";
    const baseOption = document.createElement("option");
    baseOption.value = "all";
    baseOption.textContent = fallbackOption;
    select.appendChild(baseOption);

    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  initializeInventoryControls() {
    this.populateSelect("filter-rarity", this.getCategoryValues("Rarity"), "All rarities");
    this.populateSelect("filter-exterior", this.getCategoryValues("Exterior"), "All exteriors");
    this.populateSelect("filter-type", this.getCategoryValues("Type"), "All types");

    const searchInput = document.getElementById("inventory-search");
    const raritySelect = document.getElementById("filter-rarity");
    const exteriorSelect = document.getElementById("filter-exterior");
    const typeSelect = document.getElementById("filter-type");
    const sortSelect = document.getElementById("sort-items");
    const resetBtn = document.getElementById("inventory-reset-btn");
    const quickChips = Array.from(document.querySelectorAll(".quick-chip"));

    searchInput?.addEventListener("input", async (event) => {
      this.currentFilters.search = event.target.value.trim().toLowerCase();
      this.currentPage = 1;
      await this.applyInventoryFilters();
      await this.renderInventory();
    });

    raritySelect?.addEventListener("change", async (event) => {
      this.currentFilters.rarity = event.target.value;
      this.currentPage = 1;
      await this.applyInventoryFilters();
      await this.renderInventory();
    });

    exteriorSelect?.addEventListener("change", async (event) => {
      this.currentFilters.exterior = event.target.value;
      this.currentPage = 1;
      await this.applyInventoryFilters();
      await this.renderInventory();
    });

    typeSelect?.addEventListener("change", async (event) => {
      this.currentFilters.type = event.target.value;
      this.currentPage = 1;
      await this.applyInventoryFilters();
      await this.renderInventory();
    });

    sortSelect?.addEventListener("change", async (event) => {
      this.currentFilters.sort = event.target.value;
      await this.applyInventoryFilters();
      await this.renderInventory();
    });

    resetBtn?.addEventListener("click", async () => {
      this.currentFilters = {
        search: "",
        rarity: "all",
        exterior: "all",
        type: "all",
        sort: "name-asc",
        quality: "all",
      };
      if (searchInput) searchInput.value = "";
      if (raritySelect) raritySelect.value = "all";
      if (exteriorSelect) exteriorSelect.value = "all";
      if (typeSelect) typeSelect.value = "all";
      if (sortSelect) sortSelect.value = "name-asc";
      quickChips.forEach((chip) => chip.classList.remove("active"));

      this.currentPage = 1;
      await this.applyInventoryFilters();
      await this.renderInventory();
    });

    quickChips.forEach((chip) => {
      chip.addEventListener("click", async () => {
        const isAlreadyActive = chip.classList.contains("active");
        quickChips.forEach((button) => button.classList.remove("active"));

        if (isAlreadyActive) {
          this.currentFilters.exterior = "all";
          this.currentFilters.type = "all";
          this.currentFilters.quality = "all";
        } else {
          chip.classList.add("active");
          const chipType = chip.dataset.chipType;
          const chipValue = chip.dataset.chipValue;

          this.currentFilters.exterior = chipType === "Exterior" ? chipValue : "all";
          this.currentFilters.type = chipType === "Type" ? chipValue : "all";
          this.currentFilters.quality = chipType === "Quality" ? chipValue : "all";
        }

        if (exteriorSelect) {
          exteriorSelect.value = this.currentFilters.exterior;
        }
        if (typeSelect) {
          typeSelect.value = this.currentFilters.type;
        }

        this.currentPage = 1;
        await this.applyInventoryFilters();
        await this.renderInventory();
      });
    });
  }

  getOrderIndex(value, orderList) {
    const idx = orderList.indexOf(value);
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
  }

  async applyInventoryFilters() {
    const { search, rarity, exterior, type, sort, quality } = this.currentFilters;

    const filtered = this.originalItems.filter((item) => {
      const name = (item.market_name || "").toLowerCase();
      const itemRarity = this.getTagValue(item, "Rarity");
      const itemExterior = this.getTagValue(item, "Exterior");
      const itemType = this.getTagValue(item, "Type");
      const itemQuality = this.getTagValue(item, "Quality");

      const searchMatch = !search || name.includes(search);
      const rarityMatch = rarity === "all" || itemRarity === rarity;
      const exteriorMatch = exterior === "all" || itemExterior === exterior;
      const typeMatch =
        type === "all" ||
        itemType === type ||
        (type === "Knife" && (itemType.includes("Knife") || name.includes("knife"))) ||
        (type === "Gloves" && (itemType.includes("Glove") || name.includes("glove")));
      const qualityMatch = quality === "all" || itemQuality === quality;

      return searchMatch && rarityMatch && exteriorMatch && typeMatch && qualityMatch;
    });

    filtered.sort((a, b) => {
      const nameA = a.market_name || "";
      const nameB = b.market_name || "";

      if (sort === "name-desc") {
        return nameB.localeCompare(nameA);
      }
      if (sort === "rarity-asc") {
        const rarityA = this.getTagValue(a, "Rarity");
        const rarityB = this.getTagValue(b, "Rarity");
        return (
          this.getOrderIndex(rarityA, this.itemRarityOrder) -
          this.getOrderIndex(rarityB, this.itemRarityOrder)
        );
      }
      if (sort === "exterior-asc") {
        const exteriorA = this.getTagValue(a, "Exterior");
        const exteriorB = this.getTagValue(b, "Exterior");
        return (
          this.getOrderIndex(exteriorA, this.itemExteriorOrder) -
          this.getOrderIndex(exteriorB, this.itemExteriorOrder)
        );
      }
      return nameA.localeCompare(nameB);
    });

    this.filteredItems = filtered;
  }

  async renderInventory() {
    const inventoryDiv = document.getElementById("inventory");
    const paginationDiv = document.getElementById("pagination");
    const resultCount = document.getElementById("inventory-result-count");

    if (!inventoryDiv || !paginationDiv) return;

    const totalItems = this.filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / this.itemsPerPage));
    this.currentPage = Math.min(this.currentPage, totalPages);

    if (resultCount) {
      const itemLabel = totalItems === 1 ? "item" : "items";
      resultCount.textContent = `${totalItems} ${itemLabel} matched`;
    }

    inventoryDiv.innerHTML = "";

    if (!totalItems) {
      const emptyMessage = document.createElement("p");
      emptyMessage.classList.add("inventory-empty");
      emptyMessage.textContent = "No items found for the selected filters.";
      inventoryDiv.appendChild(emptyMessage);
      paginationDiv.innerHTML = "";
      return;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageItems = this.filteredItems.slice(startIndex, endIndex);

    for (const item of pageItems) {
      const itemName = item.market_name;
      const itemType = item.type;
      const itemIconStr = item.icon_url;
      const classid = item.classid;
      const instanceid = item.instanceid;
      const assetId = item.assetId;
      const marketHashName = item.market_hash_name;
      const assetInfo = await this.getAssetInfo(classid, instanceid);

      let inspectInGameLink = "";
      if (item.actions?.[0]?.link && assetInfo?.assetid) {
        inspectInGameLink = item.actions[0].link
          .replace("%owner_steamid%", this.steamUser.steamAuthUser.id)
          .replace("%assetid%", assetInfo.assetid);
      }

      const rarity = this.getTagValue(item, "Rarity");
      const exterior = this.getTagValue(item, "Exterior");
      const itemColor = item.tags?.find((tag) => tag.category === "Rarity")?.color || "2bc0ff";
      const itemIcon = `https://steamcommunity-a.akamaihd.net/economy/image/${itemIconStr}`;

      const itemDiv = document.createElement("article");
      itemDiv.classList.add("item");
      itemDiv.style.borderLeftColor = `#${itemColor}`;

      const itemImg = document.createElement("img");
      itemImg.src = itemIcon;
      itemImg.alt = itemName;

      const itemNameElement = document.createElement("p");
      itemNameElement.classList.add("item-name");
      itemNameElement.textContent = itemName;

      const itemTypeElement = document.createElement("p");
      itemTypeElement.classList.add("item-type");
      itemTypeElement.textContent = itemType || "Unknown type";

      const itemMeta = document.createElement("p");
      itemMeta.classList.add("item-meta");
      itemMeta.textContent = `${rarity} • ${exterior}`;

      const itemPriceElement = document.createElement("p");
      itemPriceElement.classList.add("item-price");
      itemPriceElement.textContent = "Market price: Loading...";

      const shareItemForm = document.createElement("form");
      shareItemForm.classList.add("item-share-form");

      const shareItemBtn = document.createElement("input");
      shareItemBtn.classList.add("item-share-btn");
      shareItemBtn.type = "submit";
      shareItemBtn.value = "Share Item";

      shareItemForm.append(shareItemBtn);
      itemDiv.append(
        itemImg,
        itemNameElement,
        itemTypeElement,
        itemMeta,
        itemPriceElement,
        shareItemForm
      );
      inventoryDiv.appendChild(itemDiv);

      this.populateItemPrice(itemPriceElement, marketHashName);

      const itemData = {
        itemName,
        itemColor,
        itemIconStr,
        inspectInGameLink,
        marketHashName,
        assetId,
      };
      await this.shareItem(shareItemForm, itemData);
    }

    paginationDiv.innerHTML = "";
    for (let page = 1; page <= totalPages; page++) {
      const pageButton = document.createElement("button");
      pageButton.textContent = page;
      pageButton.classList.add("pagination-button");
      if (page === this.currentPage) {
        pageButton.classList.add("active");
      }
      pageButton.addEventListener("click", async () => {
        this.currentPage = page;
        await this.renderInventory();
      });
      paginationDiv.appendChild(pageButton);
    }
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

  extractItemPrice(priceData) {
    if (!priceData || typeof priceData !== "object") {
      return "N/A";
    }
    return (
      priceData.median_price ||
      priceData.lowest_price ||
      priceData.sell_price_text ||
      "N/A"
    );
  }

  async populateItemPrice(priceElement, marketHashName) {
    if (!priceElement) return;
    const priceData = await this.getItemPricing(marketHashName);
    const displayPrice = this.extractItemPrice(priceData);
    priceElement.textContent = `Market price: ${displayPrice}`;
  }

  async shareItem(form, itemData) {
    const channelId = this.isCs2ItemSharingConfigured;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const itemPrice = await this.getItemPricing(itemData.marketHashName);
      itemData.itemPrice = this.extractItemPrice(itemPrice);
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
    if (this.itemPriceCache.has(marketHashName)) {
      return this.itemPriceCache.get(marketHashName);
    }

    const response = await fetch("/discord-data/tracker/steam/itemPricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marketHashName })
    });

    if (!response.ok) {
      return { median_price: "N/A" };
    }

    const data = await response.json();
    this.itemPriceCache.set(marketHashName, data);
    return data;
  }
}
