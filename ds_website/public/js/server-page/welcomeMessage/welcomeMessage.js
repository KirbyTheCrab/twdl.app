import { populateChannelSelect } from "../../utils.js";
import PopUpMessage from "../../popUpMessageFactory.js";
export default class WelcomeMessage {
  channels = [];
  constructor() {
    this.init();
  }

  async init() {
    this.channels = await populateChannelSelect();
    await this.handleForm();
  }

  async handleForm() {
    const form = document.getElementById("welcomeMessageForm");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      const response = await fetch("/discord-data/welcomeMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      new PopUpMessage(
        responseData.message || responseData.error,
        responseData.message ? "ok" : "error"
      );
      await this.activeWelcomeMessage();
    });
    await this.activeWelcomeMessage();
  }

  async activeWelcomeMessage() {
    const data = await this.fetchActiveWelcomeMessage();
    const activeWelcomeMessage = data.parsedData;
    const table = document.getElementById("activeWelcomeMessage");
    if (
      Array.isArray(activeWelcomeMessage) &&
      activeWelcomeMessage.length == 1
    ) {
      //hide form and display table
      document.getElementById("welcomeMessageForm").style.display = "none";
      const dataRow = document.createElement("tr");
      const disableWelcomeMsg = document.createElement("button");

      activeWelcomeMessage.forEach(async (message) => {
        disableWelcomeMsg.type = "submit";
        disableWelcomeMsg.id = "disableWelcomeMsg";
        disableWelcomeMsg.textContent = "Disable Welcome Message";

        const channelMap = Object.fromEntries(
          this.channels.textChannels.map((c) => [c.id, c.name])
        );
        ["color", "channelID", "title", "message"].forEach((key) => {
          const cell = document.createElement("td");
          key === "channelID"
            ? (cell.textContent = channelMap[message[key]] || "Unknown Channel")
            : key === "color"
              ? (cell.style.backgroundColor = `${message[key]}`)
              : (cell.textContent = message[key]);

          dataRow.appendChild(cell);
        });
      });

      // Object.entries(activeWelcomeMessage).forEach(([key, value]) => {
      //   if (key === "guildID") return;
      //   const data = document.createElement("td");
      //   data.textContent = value;
      //   row.appendChild(data);
      // });
      dataRow.appendChild(disableWelcomeMsg);
      table.appendChild(dataRow);
      const activeWelcomeMessageContainer = document.getElementById(
        "activeWelcomeMessageContainer"
      );
      activeWelcomeMessageContainer.style.display = "block";
      disableWelcomeMsg.addEventListener("click", async () => {
        const confirmationDiv = document.getElementById("confirmationDIV");
        confirmationDiv.style.display = "block";
        confirmationForm.addEventListener("submit", async (confirmEvent) => {
          confirmEvent.preventDefault();
          const clickedButton = document.activeElement;
          confirmationDiv.style.display = "none";
          if (clickedButton.value === "Yes") {
            await this.disableWelcomeMsg();
          }
        });
      });
    } else if (!activeWelcomeMessage || activeWelcomeMessage.error) {
      const activeWelcomeMessageContainer = document.getElementById(
        "activeWelcomeMessageContainer"
      );
      activeWelcomeMessageContainer.style.display = "none";
      document.getElementById("welcomeMessageForm").style.display = "block";
    }
  }

  async disableWelcomeMsg() {
    const response = await fetch("/discord-data/guild/disableWelcomeMsg")
      .then((response) => response.json())
      .then((responseData) => {
        new PopUpMessage(
          responseData.message || responseData.error,
          responseData.message ? "ok" : "error"
        );
      });
    await this.activeWelcomeMessage();
    return response;
  }

  async fetchActiveWelcomeMessage() {
    return await fetch("/discord-data/getDataFromJsonFiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postFilePath: "welcomeMessage" }),
    }).then((response) => response.json());
  }
}
