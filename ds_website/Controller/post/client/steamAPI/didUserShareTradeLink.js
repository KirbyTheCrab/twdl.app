import fs from "fs-extra";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

export default async function didUserShareTradeLink(request, response) {
    const userId = request.session.userId;
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    let filePath;
    try {
        filePath = path.join(__dirname, `../../../../Model/cs2Tracker/userTradeLink.json`);
    } catch (error) {
        return { success: false, message: "Something went wrong trying to save trade link" }
    }

    let existingData = [];
    try {
        if (await fs.pathExists(filePath)) {
            const fileContent = await fs.readFile(filePath, "utf-8");
            existingData = JSON.parse(fileContent);
        }
        const userProfile = existingData.find(tl => tl.userId === userId);
        return response.json({ userProfile })
    } catch (error) {
        console.error(error);
        return response.json({ error: "Something went wrong trying to find user trade link" });
    }
}