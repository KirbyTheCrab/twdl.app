export function changeColorNoToHex(colorNo) {
  return `#${colorNo.toString(16).padStart(6, "0")}`;
}
export function showEmojiPicker() {
  let pickerVisibility = false;
  document
    .getElementById("emojiPickerTrigger")
    .addEventListener("click", () => {
      if (pickerVisibility) {
        document.getElementById("pickerContainer").style.display = "none";
        document.getElementById("emojiPickerTrigger").textContent =
          "Pick emoji";
        pickerVisibility = false;
      } else {
        document.getElementById("emojiPickerTrigger").textContent =
          "Close picker";
        document.getElementById("pickerContainer").style.display = "block";
        pickerVisibility = true;
      }
    });
}
export function selectedEmoji(picker) {
  picker.addEventListener("emoji:select", (event) => {
    document.getElementById("selectedEmoji").value = event.emoji;
  });
}
export async function getTextChannels() {
  const response = await fetch(`/discord-data/guild/text-channels`).then(
    (response) => response.json()
  );
  return response;
}
export async function getRoles() {
  const response = await fetch("/discord-data/guild/roles").then((response) =>
    response.json()
  );
  return response;
}
export async function populateChannelSelect() {
  const channels = await getTextChannels();
  // const channelSelection = document.getElementById("channel");
  const channelSelections = document.querySelectorAll('#channel, #edit-channel');
  channelSelections.forEach((channelSelection) => {
    console.log(channelSelection);
    const channelsData = channels.textChannels;
    for (let i = 0; i < channelsData.length; i++) {
      if (channelsData[i].type == "0") {
        //type 0 is text channel
        const channelOption = document.createElement("option");
        channelOption.value = channelsData[i].id;
        channelOption.textContent = `#${channelsData[i].name}`;
        channelSelection.append(channelOption);
      }
    }
  });

  return channels;
}
