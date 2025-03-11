import PopUpMessage from "../../popUpMessageFactory.js";
export default class r6Tracker {
  constructor() {
    this.init();
  }
  async init() {
    await this.enableR6Tracker();
  }
  async enableR6Tracker() {
    //document declarations
    const checkbox = document.getElementById("enabler6Tracker");
    const enableR6TrackerDiv = document.getElementById("enableR6TrackerDiv");
    const initR6TrackerDiv = document.getElementById("initR6TrackerDiv");
    const mainDiv = document.getElementById("main");

    //pre-reqs
    const trackerIsEnabled = await this.isTrackerEnabled();
    const userRegistered = await this.isUserRegistered();

    initR6TrackerDiv.style.display = "none";
    if (trackerIsEnabled) {
      enableR6TrackerDiv.remove();
      initR6TrackerDiv.style.display = "block";
      const form = document.getElementById("initR6Tracker");
      form.addEventListener(
        "submit",
        async (event) => {
          event.preventDefault();
          const formData = new FormData(form);
          const data = {};
          formData.forEach((value, key) => {
            data[key] = value;
          });
          //initialise r6 tracker for guild by creating a file with guildid
          //only save user if there is no object with userid same as current user
          if (!userRegistered) {
            await this.saveUser(data);
          }
        },
        { once: true }
      );
    }

    checkbox.addEventListener("change", async () => {
      if (checkbox.checked) {
        await this.initR6Tracker();
      } else {
        initR6TrackerDiv.style.display = "none";
      }
    });

    if (userRegistered) {
      enableR6TrackerDiv.remove();
      initR6TrackerDiv.remove();
      mainDiv.style.display = "block";
      // await this.r6TrackerApiConn();
    }
  }
  async saveUser(data) {
    await fetch("/discord-data/r6Tracker/saveUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((response) => {
        new PopUpMessage(
          response.message || response.error,
          response.message ? "ok" : "error"
        );
      });
  }
  async initR6Tracker() {
    await fetch("/discord-data/r6Tracker/initR6Tracker", {
      method: "POST",
    })
      .then((response) => response.json())
      .then((response) => {
        new PopUpMessage(
          response.message || response.error,
          response.message ? "ok" : "error"
        );
      })
      .catch((error) => {
        console.log("error initialising r6 tracker ", error);
      });
  }
  async isTrackerEnabled() {
    let isEnabled;
    await fetch(`/discord-data/guild/r6Tracker/isEnabled?str=r6Tracker`)
      .then((response) => response.json())
      .then((response) => {
        isEnabled = response.isEnabled;
      });
    return isEnabled;
  }
  async isUserRegistered() {
    let isUserRegistered;
    await fetch("/discord-data/r6Tracker/isUserRegistered")
      .then((response) => response.json())
      .then((response) => {
        isUserRegistered = response.isUserRegistered;
      });
    return isUserRegistered;
  }
}
