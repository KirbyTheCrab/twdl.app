import fs from "fs-extra";

export default async function getServerPlaylists(request, response) {
    const serverId = request.session.serverPageId;
    const filePath = "../ds_bot/model/spotifyNoti/serverConfigs.json";

    try {
        const fileContent = await fs.readFile(filePath, "utf-8");
        const existingData = JSON.parse(fileContent);
        const serverData = existingData.serverConfigs.find(pl => pl.serverId === serverId);
        if (!serverData) {
            return response.status(404).json({ error: "Server not found" });
        }
        const playlists = serverData.playlists;
        return response.json({ playlists: playlists })
    } catch (error) {
        console.error("Error reading serverConfigs.json", error);
    }
}