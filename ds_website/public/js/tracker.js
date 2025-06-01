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
  furtherSettings;
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
    [
      this.trackerIsEnabled,
      this.userMod,
      this.steamAuthUser
    ] = await Promise.all([
      this.isTrackerEnabled(),
      this.isUserMod(),
      this.getSteamAuthUser(),
    ]);
  }

  setupCheckboxListener() {
    if (!this.checkbox) return;
    this.checkbox.addEventListener("change", async () => {
      if (this.checkbox.checked) {
        await this.initTracker();
        this.updateUI();
      } else {
        const confirmationDiv = document.getElementById("confirmationDIV");
        const confirmationForm = document.getElementById("confirmationForm");
        if (confirmationDiv && confirmationForm) {
          confirmationDiv.style.display = "block";
          const submitHandler = async (confirmEvent) => {
            confirmEvent.preventDefault();
            const clickedButton = document.activeElement;
            confirmationDiv.style.display = "none";
            if (clickedButton?.value === "Yes") {
              // Remove file from cs2Tracker
              this.trackerIsEnabled = false;
              this.updateUI();
            }
            this.initTrackerDiv && (this.initTrackerDiv.style.display = "none");
            confirmationForm.removeEventListener("submit", submitHandler);
          };
          confirmationForm.addEventListener("submit", submitHandler);
        }
      }
    });
  }

  updateUI() {
    if (this.userMod && this.enableTrackerDiv) {
      this.enableTrackerDiv.style.display = "block";
    }
    if (this.initTrackerDiv) {
      this.initTrackerDiv.style.display =
        this.trackerIsEnabled && !this.steamAuthUser ? "block" : "none";
    }
    if (this.checkbox) {
      this.checkbox.checked = !!this.trackerIsEnabled;
    }
    if (this.trackerIsEnabled && this.furtherSettings) {
      this.furtherSettings.style.display = "block";
      populateChannelSelect();
    }
    if (this.steamAuthUser) {
      if (this.initTrackerDiv) this.initTrackerDiv.remove();
      if (this.mainDiv) this.mainDiv.style.display = "block";
      const profile = document.getElementById("profile");
      const name = document.getElementById("name");
      if (profile && this.steamAuthUser._json?.avatarmedium) {
        profile.src = this.steamAuthUser._json.avatarmedium;
      }
      if (name && this.steamAuthUser.displayName) {
        name.textContent = this.steamAuthUser.displayName;
      }
    }
  }

  async saveUser(data) {
    try {
      const response = await fetch(
        `/discord-data/tracker/saveUser?gameTracker=${this.gameTracker}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      const result = await response.json();
      new PopUpMessage(
        result.message || result.error,
        result.message ? "ok" : "error"
      );
    } catch (error) {
      new PopUpMessage("Failed to save user.", "error");
    }
  }

  async initTracker() {
    showLoadingScreen();
    try {
      const response = await fetch(
        `/discord-data/tracker/initTracker?gameTracker=${this.gameTracker}`,
        { method: "POST" }
      );
      const result = await response.json();
      this.trackerIsEnabled = await this.isTrackerEnabled();
      if (result.message && this.initTrackerDiv) {
        this.initTrackerDiv.style.display = "block";
      }
      new PopUpMessage(
        result.message || result.error,
        result.message ? "ok" : "error"
      );
    } catch (error) {
      console.log("error initialising tracker ", error);
      new PopUpMessage("Error initialising tracker.", "error");
    }
    hideLoadingScreen();
  }

  // Getters
  async isTrackerEnabled() {
    const serverId = await this.getServerId();
    const response = await fetch(`/discord-data/guild/tracker/isEnabled`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameTracker: this.gameTracker,
        guildID: serverId,
      }),
    });
    const data = await response.json();
    return data.isEnabled;
  }

  async isUserMod() {
    const response = await fetch("/session/isMod");
    const data = await response.json();
    return data.isMod;
  }

  async getSteamAuthUser() {
    const response = await fetch("/session/steamAuthUser");
    const data = await response.json();
    return data.steamAuthUser;
  }

  async getSteamUser() {
    return this.steamAuthUser;
  }

  async getIsTrackerEnabled() {
    return this.trackerIsEnabled;
  }

  async getServerId() {
    const response = await fetch("/session/serverPageId");
    const data = await response.json();
    return data.serverPageId;
  }
}