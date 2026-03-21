import client from "../../../../ds_bot/main.js";

export default async function removeDiscordMessage(request, response) {
  const { messageId, channelId } = request.query;

  try {
    const channel = await client.channels.fetch(channelId);

    if (channel.isTextBased()) {
      const message = await channel.messages.fetch(messageId);
      message.delete();
      return response.json({ message: "Message removed!" });
    }
  } catch (error) {
    response.json({ error: error });
  }
}
