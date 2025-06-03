import { populateChannelSelect } from "../../utils.js";
import PopUpMessage from "../../popUpMessageFactory.js";
import { hideLoadingScreen, showLoadingScreen } from '../../loadingScreen.js'
export default class SpotifyNotification {
    serverInfoPage;
    playlists;
    constructor(serverInfoPage) {
        this.serverInfoPage = serverInfoPage;
        this.init();
    }

    async init() {
        showLoadingScreen();
        try {
            this.playlists = await this.fetchServerPlaylist();
            if (this.playlists && !this.playlists.length == 0) {
                await this.displayPlaylistsTable();
            }
            populateChannelSelect();
            await this.addNewPlaylist();
            await this.listUsers(this.serverInfoPage.serverUserList);
            this.serverInfoPage.filterSearch("#spotify-buddies-ul", "spotify-buddie-search");
            hideLoadingScreen();
        } catch (error) {
            console.log(error);
        }
    }
    async getUserSpotifyConnection() {
        const [accessTokenRes, tokenTypeRes] = await Promise.all([
            fetch("/session/accessToken").then((res) => res.json()),
            fetch("/session/tokenType").then((res) => res.json()),
        ]);

        await fetch(`https://discord.com/api/users/@me/connections`, {
            headers: { "Authorization": `${tokenTypeRes.tokenType} ${accessTokenRes.accessToken}` }
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.length == 0) {
                    console.log("User has no connections");
                    return false;
                }
                for (let i = 0; i < response.length; i++) {
                    if (response[i].type === "spotify") {
                        console.log("This user has spotify connection")
                        return true;
                    }
                }

            })
    }
    async addNewPlaylist() {
        const newPlaylistBtn = document.getElementById("addPlaylist");
        newPlaylistBtn.addEventListener("click", async () => {
            const newPlaylistFormHeader = document.getElementById("enableSpotifyNotiDiv");
            newPlaylistFormHeader.classList.add("visible");
            await this.closePlaylistCreator("add");
            await this.toggleTextChannelInput("add");
            await this.addSpotifyBuddies();
        })
    }
    async closePlaylistCreator(action) {
        let closeBtn;
        if (action === "add") {
            closeBtn = document.getElementById("closePlaylistCreator");
            closeBtn.addEventListener("click", () => {
                const newPlaylistFormHeader = document.getElementById("enableSpotifyNotiDiv");
                newPlaylistFormHeader.classList.remove("visible");
            })
        } else {
            closeBtn = document.getElementById("closeEditPlaylistCreator")
            closeBtn.addEventListener("click", () => {
                const newPlaylistFormHeader = document.getElementById("enableEditSpotifyNotiDiv");
                newPlaylistFormHeader.classList.remove("visible");
            })
        }
    }
    async toggleTextChannelInput(action) {
        let dmRadio;
        let tcRadio;
        if (action === "add") {
            dmRadio = document.getElementById('dm');
            tcRadio = document.getElementById('tc');
        } else {
            dmRadio = document.getElementById('edit-dm');
            tcRadio = document.getElementById('edit-tc');
        }

        dmRadio.addEventListener('change', () => this.toggleSelect(action));
        tcRadio.addEventListener('change', () => this.toggleSelect(action));
    }
    toggleSelect(action) {
        let tcRadio;
        let channelSelect;
        if (action === "add") {
            tcRadio = document.getElementById('tc');
            channelSelect = document.getElementById("channel");
        } else {
            tcRadio = document.getElementById('edit-tc');
            channelSelect = document.getElementById("edit-channel");
        }
        channelSelect.style.display = tcRadio.checked ? 'inline' : 'none';
    }
    /**
     * 
     * @param {List of ids of users in server (includes bots)} serverUserList 
     */
    async listUsers(serverUserList) {
        const userInfoUls = document.querySelectorAll("#spotify-buddies-ul, #edit-spotify-buddies-ul");
        serverUserList.sort();

        for (let userid of serverUserList) {
            const user = await this.serverInfoPage.fetchUser(userid);
            if (user && !user.isBot) {
                const userLiElement = document.createElement("li");
                const userInputElement = document.createElement("input");
                const userIconElement = document.createElement("img");

                userInputElement.type = "checkbox";
                userInputElement.value = user.user.userId;
                userInputElement.style.display = "none"

                userLiElement.classList.add("user-list-li");
                userInputElement.name = "spotifyBuddies[]";

                userIconElement.src = user.user.displayAvatarURL;
                userIconElement.classList.add("userIcon");

                userLiElement.append(userIconElement, userInputElement);
                userLiElement.appendChild(document.createTextNode(user.user.displayName));


                userInfoUls.forEach(ul => {
                    const clone = userLiElement.cloneNode(true);
                    clone.addEventListener("click", () => {
                        const input = clone.querySelector("input");
                        input.checked = !input.checked;
                        clone.classList.toggle("selected", input.checked);
                    })
                    ul.appendChild(clone);
                })
            }
        }
    }
    async getServerInfo() {
        const response = await fetch("/discord-data/guild/guild-data");
        const responseJson = await response.json();
        return responseJson;
    }
    async addSpotifyBuddies() {
        const serverInfo = await this.getServerInfo();
        const forms = document.querySelectorAll("#spotifyPlaylistNotificationChannel, #editSpotifyPlaylist");
        forms.forEach((form) => {
            form.addEventListener("submit", async (event) => {
                event.preventDefault();
                const formData = new FormData(form);
                const data = {};
                formData.forEach((value, key) => {
                    if (data[key]) {
                        if (!Array.isArray(data[key])) {
                            data[key] = [data[key]];
                        }
                        data[key].push(value);
                    } else {
                        data[key] = value;
                    }
                });
                data.serverInfo = serverInfo;
                await this.fetchBuddieListAdd(data);
            })
        })

    }
    async fetchBuddieListAdd(data) {
        console.log(data);
        await fetch("/discord-data/spotify/buddies-list/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.message) {
                    new PopUpMessage(response.message, "ok")
                    setTimeout(() => {
                        location.reload();
                    }, 500);
                } else {
                    new PopUpMessage(response.error, "error");
                }
            });
    }
    async displayPlaylistsTable() {
        const tableHeader = document.getElementById("playlistTableHeader");
        const table = document.getElementById("playlistsTable");
        tableHeader.style.display = "block";
        this.playlists.forEach(async (playlist) => {
            const playlistRow = document.createElement("tr");
            const fields = ["playlistName", "messageType", "spotifyBuddies"];
            for (const field of fields) {
                const cell = document.createElement("td");
                if (field === "messageType") {
                    if (playlist[field] === "tc") {
                        const channelName = await this.getChannelName(playlist["notificationChannel"]);
                        cell.textContent = `Text Channel - #${channelName}`;
                    } else {
                        cell.textContent = "Direct Message";
                    }

                } else if (field === "spotifyBuddies") {
                    const queueCount = playlist["queueCount"];
                    const activeBuddie = playlist[field][queueCount];
                    const buddieSpanDiv = document.createElement("div");
                    playlist[field].sort();
                    await Promise.all(
                        playlist[field].map(async (buddie, index) => {
                            const span = document.createElement("span");
                            const username = await this.getUsername(buddie);
                            if (buddie === activeBuddie) {
                                span.classList.add("active-buddie");
                                span.title = "This buddy is next to add a song to the playlist"

                            }
                            span.id = "span-buddie";
                            buddieSpanDiv.append(span);
                            span.textContent = username;
                            cell.append(buddieSpanDiv);
                            if (index < playlist[field].length - 1) {
                                buddieSpanDiv.append(", ");
                            }
                        })
                    );
                } else {
                    cell.textContent = playlist[field];
                }
                cell.name = field;
                playlistRow.appendChild(cell);
            }
            // Add action buttons (Delete and Edit)
            const actionCell = document.createElement("td");
            const deleteBtn = document.createElement("button");
            const editBtn = document.createElement("button");

            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener("click", () => this.deletePlaylist(playlist.playlistId));
            editBtn.textContent = "Edit";
            editBtn.addEventListener("click", () => this.editPlaylist(playlist));

            actionCell.appendChild(deleteBtn);
            actionCell.appendChild(editBtn);
            playlistRow.appendChild(actionCell);
            table.appendChild(playlistRow);
        })
    }
    async deletePlaylist(playlistId) {
        const confirmationDiv = document.getElementById("confirmationDIV");
        confirmationDiv.style.display = "block";
        confirmationForm.addEventListener("submit", async (confirmEvent) => {
            confirmEvent.preventDefault();
            const clickedButton = document.activeElement;
            confirmationDiv.style.display = "none";
            if (clickedButton.value === "Yes") {
                await fetch("/discord-data/spotify/playlist/remove", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ playlistId })
                })
                    .then((response) => response.json())
                    .then((response) => {
                        if (response.message) {
                            new PopUpMessage(response.message, "ok")
                            setTimeout(() => {
                                location.reload();
                            }, 500);
                        } else {
                            new PopUpMessage(response.error, "error");
                        }
                    })
            }
        });
    }
    async editPlaylist(playlist) {

        //element declarations
        const newPlaylistFormHeader = document.getElementById("enableEditSpotifyNotiDiv");
        const playlistId = document.getElementById("edit-playlistId");
        const dm = document.getElementById("edit-dm");
        const tc = document.getElementById("edit-tc");
        const playlistName = document.getElementById("playlistName");

        //pre-reqs
        //make form visible
        newPlaylistFormHeader.classList.add("visible");
        //event listener for close button
        await this.closePlaylistCreator("edit");
        //event listeners for radio buttons (tc and dm)
        await this.toggleTextChannelInput("edit");

        if (playlist["messageType"] === "dm") {
            dm.checked = true;
        } else {
            tc.checked = true;
            const editChannel = document.getElementById("edit-channel");
            editChannel.style.display = "block";
            editChannel.value = playlist["notificationChannel"];
        }
        playlistId.value = playlist["playlistId"];
        playlistId.readOnly = true;

        for (const buddie in playlist["spotifyBuddies"]) {
            const buddieLis = document.querySelectorAll("#edit-spotify-buddies-ul .user-list-li");
            buddieLis.forEach(li => {
                const input = li.querySelector("input");
                if (input && input.value === playlist["spotifyBuddies"][buddie]) {
                    input.checked = true;
                    li.classList.add("selected"); // Optional: visually mark as selected
                }
            })
        }
        playlistName.textContent = playlist["playlistName"];
        await this.addSpotifyBuddies();
    }
    async getUsername(userId) {
        const response = await fetch("/discord-data/guild/user-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId })
        })
        const userData = await response.json();
        return userData.user.user.displayName;
    }
    async getChannelName(channelId) {
        const response = await fetch("/discord-data/guild/channel-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channelId })
        })
        const channel = await response.json();
        return channel.name;
    }
    async fetchServerPlaylist() {
        let playlists;
        await fetch("/discord-data/spotify/playlists")
            .then((response) => response.json())
            .then((response) => {
                playlists = response.playlists;
            })
        return playlists;
    }
}