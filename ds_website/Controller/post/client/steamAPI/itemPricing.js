export default async function itemPricing(request, response) {
    const { marketHashName } = request.body;
    const apiResponse = await fetch(`http://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=${marketHashName}`)
    const data = await apiResponse.json();
    return response.json(data);
}
