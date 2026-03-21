export default async function itemPricing(request, response) {
    const { marketHashName } = request.body;
    console.log(`[itemPricing] Fetching price for: ${marketHashName}`);
    const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=${encodeURIComponent(marketHashName)}`;
    const apiResponse = await fetch(url);
    const rawText = await apiResponse.text();
    console.log(`[itemPricing] HTTP ${apiResponse.status} for "${marketHashName}": ${rawText}`);
    return response.status(apiResponse.status).send(rawText);
}
