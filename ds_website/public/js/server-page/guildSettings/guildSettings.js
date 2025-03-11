import PopUpMessage from "../../popUpMessageFactory.js";
export default class GuildSettings {
  constructor(serverInfo) {
    this.serverInfo = serverInfo;
    this.setGuildName();
    this.setGuildIcon();
  }
  async setGuildName() {
    document
      .getElementById("changeGuildName")
      .addEventListener("submit", async function (event) {
        event.preventDefault();
        const guildName = document.getElementById("guildName").value;
        await fetch(`/discord-data/setGuildName?name=${guildName}`, {
          method: "POST",
        })
          .then((response) => response.json())
          .then((response) => {
            if (response.message) {
              new PopUpMessage(response.message, "ok");
            } else {
              new PopUpMessage(response.error, "error");
            }
          });
      });
  }

  async setGuildIcon() {
    document
      .getElementById("changeGuildIcon")
      .addEventListener("submit", async function (event) {
        event.preventDefault();
        console.log("Form submitted!");
        const guildIcon = document.getElementById("guildIcon").files[0];
        const formData = new FormData();
        formData.append("image", guildIcon);
        await fetch(`/discord-data/setGuildIcon`, {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((response) => {
            if (response.message) {
              new PopUpMessage(response.message, "ok");
            } else {
              new PopUpMessage(response.error, "error");
            }
          });
      });
  }
}
