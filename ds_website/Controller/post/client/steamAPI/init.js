import saveToFile from "../saveToFile.js";
/**
 * Creates a file with guild id representing that r6 tracker has been enabled for this guild
 * @param {*} request
 * @param {*} response
 * @returns
 */
export default async function cs2Init(request, response) {
  const guildID = request.session.serverPageId;
  const { channel } = request.body;

  const data = {
    channel,
  };

  try {
    await saveToFile(data, `/cs2Tracker/${guildID}.json`);
    return response.json({ message: "CS2 Tracker initialized" });
  } catch (error) {
    console.log(error);
    return response.json({ error: `Something went wrong ${error}` });
  }
}
