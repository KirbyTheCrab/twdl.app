import { createPicker } from "https://cdn.jsdelivr.net/npm/picmo@latest/+esm";
import PopUpMessage from "../../popUpMessageFactory.js";
import {
  showEmojiPicker,
  selectedEmoji,
  getRoles,
  changeColorNoToHex,
  populateChannelSelect,
} from "../../utils.js";

export default class ReactionRoles {
  channels = [];
  roles = [];
  activeReactionRoles = [];
  constructor() {
    const rootElement = document.getElementById("pickerContainer");
    const picker = createPicker({ rootElement });
    selectedEmoji(picker);
    showEmojiPicker();
    this.initialisePage();
  }
  async initialisePage() {
    this.activeReactionRoles = await this.fetchActiveReactionRoles();
    this.channels = await populateChannelSelect();
    await this.populateRoleSelect();
    await this.formHandling();
  }
  async formHandling() {
    const form = document.getElementById("embededMessageReactionRole");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });
      const response = await fetch(`/discord-data/createEmbed`, {
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
      await this.refreshActiveReactionRoles();
    });
    await this.refreshActiveReactionRoles();
  }
  async fetchActiveReactionRoles() {
    const response = await fetch("/discord-data/getDataFromJsonFiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postFilePath: "activeReactionRoles" }),
    });
    return await response.json();
  }
  async refreshActiveReactionRoles() {
    const data = await this.fetchActiveReactionRoles();
    const activeReactionRoles = data.parsedData;
    const table = document.getElementById("activeReactionRoleTbody");
    const tableDiv = document.getElementById("reactionRoleTableDiv");
    if (activeReactionRoles.length === 0) {
      tableDiv.style.display = "none";
    } else {
      tableDiv.style.display = "block";
    }
    table.innerHTML = "";

    activeReactionRoles.forEach(async (role) => {
      const dataRow = document.createElement("tr");

      // Create Delete/Edit buttons
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "submit";
      deleteBtn.textContent = "Delete";

      const editBtn = document.createElement("button");
      editBtn.type = "submit";
      editBtn.textContent = "Edit";

      // Hidden input fields for form
      const deleteData = document.createElement("input");
      deleteData.type = "hidden";
      deleteData.name = "deleteThisReactionRole";
      deleteData.value = role["messageID"];

      const editData = document.createElement("input");
      editData.type = "hidden";
      editData.name = "editThisReactionRole";
      editData.value = role["messageID"];

      // Forms
      const deleteForm = document.createElement("form");
      deleteForm.classList.add("deleteActiveReactionRole");
      deleteForm.append(deleteBtn, deleteData);

      const editForm = document.createElement("form");
      editForm.classList.add("editActiveReactionRole");
      editForm.append(editBtn, editData);

      // Table cells
      const channelMap = Object.fromEntries(
        this.channels.textChannels.map((c) => [c.id, c.name])
      );
      const roleMap = Object.fromEntries(
        this.roles.roles.map((r) => [r.id, r.name])
      );

      ["favcolor", "channel", "title", "emoji", "role"].forEach((key) => {
        const cell = document.createElement("td");
        cell.textContent =
          key === "channel"
            ? channelMap[role[key]] || "Unknown Channel"
            : key === "role"
            ? roleMap[role[key]] || "Unknown Role"
            : key === "favcolor"
            ? (cell.style.backgroundColor = `${role[key]}`)
            : role[key];
        dataRow.appendChild(cell);
      });

      // Append forms to table row
      const deleteFormCell = document.createElement("td");
      deleteFormCell.appendChild(deleteForm);

      const editFormCell = document.createElement("td");
      editFormCell.appendChild(editForm);

      dataRow.append(deleteFormCell, editFormCell);
      table.appendChild(dataRow);
    });
    await this.removeActiveReactionRole();
  }
  async populateRoleSelect() {
    this.roles = await getRoles();
    const roleSelect = document.getElementById("role");
    const roleList = this.roles.roles;
    for (let i = 0; i < roleList.length; i++) {
      const roleOption = document.createElement("option");
      roleOption.value = roleList[i].id;
      roleOption.textContent = roleList[i].name;
      if (roleList[i].color === 0) {
        roleOption.style.color = "black";
        roleOption.style.backgroundColor = "#0092ca";
      } else {
        const colorHex = changeColorNoToHex(roleList[i].color);
        roleOption.style.backgroundColor = colorHex;
        roleOption.style.color = "black";
      }
      roleSelect.append(roleOption);
    }
  }
  async removeActiveReactionRole() {
    const data = await this.fetchActiveReactionRoles();
    let activeReactionRoles = data.parsedData;
    const deleteForms = document.querySelectorAll(".deleteActiveReactionRole");
    const confirmationDiv = document.getElementById("confirmationDIV");
    const confirmationForm = document.getElementById("confirmationForm");

    let currentForm = null;
    deleteForms.forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        confirmationDiv.style.display = "block";
        currentForm = form;
      });

      confirmationForm.addEventListener("submit", async (confirmEvent) => {
        confirmEvent.preventDefault();
        const clickedButton = document.activeElement;
        confirmationDiv.style.display = "none";
        if (clickedButton.value === "Yes") {
          const formData = new FormData(currentForm);
          const data = Object.fromEntries(formData.entries());

          //filter out message with matching id
          let messageID = null;
          let channelID = null;
          activeReactionRoles = activeReactionRoles.filter((role) => {
            channelID = role.channelID;
            messageID = role.messageID;
            return role.messageID !== data.deleteThisReactionRole;
          });
          try {
            await fetch(
              `/discord-data/deleteDiscordMessage?messageId=${messageID}&channelId=${channelID}`,
              {
                method: "POST",
              }
            )
              .then((response) => response.json())
              .then((response) => {
                console.log(response);
              });
            const response = await fetch("/discord-data/saveRoleReactionFile", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(activeReactionRoles),
            });
            const responseData = await response.json();
            new PopUpMessage(
              responseData.message || responseData.error,
              responseData.message ? "ok" : "error"
            );
          } catch (error) {
            console.error("Error saving role reaction file:", error);
          }
        }
        await this.refreshActiveReactionRoles();
      });
    });
  }
  async editActiveReactionRole() {
    // let activeReactionRoles = this.activeReactionRoles.parsedData;
    // document
    //   .querySelectorAll(".editActiveReactionRole")
    //   .forEach((form, index) => {
    //     form.addEventListener("submit", (event) => {
    //       event.preventDefault();
    //       const formData = new FormData(form);
    //       const data = {};
    //       formData.forEach((value, key) => {
    //         console.log(key, value);
    //       });
    //     });
    //   });
  }
}
