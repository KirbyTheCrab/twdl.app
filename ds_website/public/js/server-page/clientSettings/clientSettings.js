import PopUpMessage from "../../popUpMessageFactory.js";
export default class ClientSettings {
  constructor(serverInfo) {
    this.serverInfo = serverInfo;
    this.setNickname();
    // this.setRoles();
    this.kickClient();
    this.resetNickname();
  }

  async setNickname() {
    document
      .getElementById("changeNickname")
      .addEventListener("submit", async function (event) {
        event.preventDefault();
        const nickname = document.getElementById("nickname").value;
        await fetch(`/discord-data/setClientNickname?nickname=${encodeURIComponent(nickname)}`, {
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

  async resetNickname() {
    document
      .getElementById("resetNickname")
      .addEventListener("submit", async function (event) {
        event.preventDefault();
        await fetch(`/discord-data/setClientNickname?nickname=TWDL2.0`, {
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

  // async setRoles() {
  //   await this.serverInfo.listRoles("clientSettings-role-list");
  //   const rolelistUl = document.getElementById("clientSettings-role-list");
  //   const roleLiList = rolelistUl.getElementsByClassName("role-list-li");
  //   for (const roleLi of roleLiList) {
  //     const checkbox = document.createElement("input");
  //     checkbox.type = "checkbox";
  //     roleLi.appendChild(checkbox);
  //   }
  //   // console.log(roleLi);
  //   document
  //     .getElementById("roleAssignment")
  //     .addEventListener("submit", async function (event) {
  //       event.preventDefault();
  //     });
  // }

  async kickClient() {
    document
      .getElementById("kickClient")
      .addEventListener("submit", async function (event) {
        if (
          confirm("Are you sure you want to kick the client from the server?")
        ) {
          event.preventDefault();
          await fetch("/discord-data/kickClient", {
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
        } else {
          return;
        }
      });
  }
}
