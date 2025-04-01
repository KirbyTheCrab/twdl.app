import PopUpMessage from "./popUpMessageFactory.js";
import { hideLoadingScreen, showLoadingScreen } from "./loadingScreen.js";
import { populateChannelSelect } from "../js/utils.js";
export default class Tracker {
  gameTracker;
  trackerIsEnabled;
  checkbox;
  enableTrackerDiv;
  initTrackerDiv;
  mainDiv;
  userMod;
  steamAuthUser;
  constructor(gameTracker) {
    this.gameTracker = gameTracker;
    this.checkbox = document.getElementById("enableTracker");
    this.enableTrackerDiv = document.getElementById("enableTrackerDiv");
    this.initTrackerDiv = document.getElementById("initTrackerDiv");
    this.mainDiv = document.getElementById("main");
    this.furtherSettings = document.getElementById("furtherSettings");
    this.init();
  }
  async init() {
    await this.fetchTrackerStatus();
    this.setupCheckboxListener();
    this.updateUI();
  }

  async fetchTrackerStatus() {
    [this.trackerIsEnabled, this.userMod, this.steamAuthUser] =
      await Promise.all([
        this.isTrackerEnabled(),
        this.isUserMod(),
        this.getSteamAuthUser(),
      ]);
  }

  setupCheckboxListener() {
    this.checkbox.addEventListener("change", async () => {
      if (this.checkbox.checked) {
        await this.initTracker();
      } else {
        initTrackerDiv.style.display = "none";
      }
    });
  }

  updateUI() {
    if (this.userMod) {
      enableTrackerDiv.style.display = "block";
    }
    this.initTrackerDiv.style.display =
      this.trackerIsEnabled && !this.steamAuthUser ? "block" : "none";
    this.checkbox.checked = this.trackerIsEnabled;
    if (this.trackerIsEnabled) {
      furtherSettings.style.display = "block";
      populateChannelSelect();
    }
    if (this.steamAuthUser) {
      this.initTrackerDiv.remove();
      this.mainDiv.style.display = "block";
      document.getElementById("profile").src =
        this.steamAuthUser._json.avatarmedium;
      document.getElementById("name").textContent =
        this.steamAuthUser.displayName;
      this.initTrackerDiv.remove();
      this.mainDiv.style.display = "block";
    }
  }
  async saveUser(data) {
    await fetch(
      `/discord-data/tracker/saveUser?gameTracker=${this.gameTracker}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    )
      .then((response) => response.json())
      .then((response) => {
        new PopUpMessage(
          response.message || response.error,
          response.message ? "ok" : "error"
        );
      });
  }
  async initTracker() {
    showLoadingScreen();
    await fetch(
      `/discord-data/tracker/initTracker?gameTracker=${this.gameTracker}`,
      {
        method: "POST",
      }
    )
      .then((response) => response.json())
      .then(async (response) => {
        await this.isTrackerEnabled();
        if (response.message) {
          this.initTrackerDiv.style.display = "block";
        }
        new PopUpMessage(
          response.message || response.error,
          response.message ? "ok" : "error"
        );
      })
      .catch((error) => {
        console.log("error initialising tracker ", error);
      });
    hideLoadingScreen();
  }
  //getters
  async isTrackerEnabled() {
    const serverId = await this.getServerId();
    return fetch(`/discord-data/guild/tracker/isEnabled`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameTracker: this.gameTracker,
        guildID: serverId,
      }),
    })
      .then((res) => res.json())
      .then((data) => data.isEnabled);
  }
  async isUserMod() {
    return await fetch("/session/isMod")
      .then((res) => res.json())
      .then((data) => data.isMod);
  }
  async getSteamAuthUser() {
    return await fetch("/session/steamAuthUser")
      .then((res) => res.json())
      .then((data) => data.steamAuthUser);
  }
  async getSteamUser() {
    return this.steamAuthUser;
  }
  async getIsTrackerEnabled() {
    return this.trackerIsEnabled;
  }
  async getServerId() {
    return fetch("/session/serverPageId")
      .then((res) => res.json())
      .then((data) => data.serverPageId);
  }
}
