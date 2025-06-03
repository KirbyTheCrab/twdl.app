import fs from "fs-extra";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

export default async function removePlaylist(request, response) {
    const serverId = request.session.serverPageId;
    const { playlistId } = request.body;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    let filePath;
    try {
        filePath = path.join(__dirname, `../../../../../ds bot/model/spotifyNoti/serverConfigs.json`);
    } catch (error) {
        return { success: false, error: "Configuration file not found" };
    }

    let existingData = [];
    try {

        //verify file exists and get existing data
        if (await fs.pathExists(filePath)) {
            const fileContent = await fs.readFile(filePath, "utf-8");
            existingData = JSON.parse(fileContent);
        }

        //verify if playlist exists by going through each server in the serverConfig array and then
        //looking at each element in the playlists array 
        const playlistExists = existingData.serverConfigs.some(serverConfig =>
            serverConfig.playlists.some(pl => pl.playlistId === playlistId)
        );
        if (playlistExists) {
            existingData.serverConfigs = existingData.serverConfigs.map(serverConfig => {
                if (serverConfig.playlists.some(pl => pl.playlistId === playlistId)) {
                    serverConfig.playlists = serverConfig.playlists.filter(pl => pl.playlistId !== playlistId);
                }
                return serverConfig;
            });
            try {
                //save new data to file
                await fs.writeFile(filePath, JSON.stringify(existingData, null, 2), "utf-8");
                return response.json({ message: "Playlist removed successfully" });
            } catch (error) {
                return response.json({ error: "Failed to remove playlist" })
            }
        } else {
            return response.json({ error: "This playlist does not exists" });
        }
    } catch (error) {
        console.log(error);
        return response.json({ error: "Something went wrong trying to remove the playlist" })
    }
}
