const clientDataList = document.getElementById("guildList");

fetch("/discord-data/client/user-count")
  .then((response) => response.json())
  .then((userCount) => {
    const userCountLiElement = document.createElement("p");
    userCountLiElement.textContent = `Helping ${userCount.userCount} users`;
    clientDataList.appendChild(userCountLiElement);
  })
  .catch((error) => console.error("Failed to fetch discord data", error));

fetch("/discord-data/client/guild-count")
  .then((response) => response.json())
  .then((guildCount) => {
    const guildCountLiElement = document.createElement("p");
    guildCountLiElement.textContent = `in ${guildCount.guildCount} servers`;
    clientDataList.appendChild(guildCountLiElement);
  })
  .catch((error) => console.error("Could not retrieve guild count", error));
