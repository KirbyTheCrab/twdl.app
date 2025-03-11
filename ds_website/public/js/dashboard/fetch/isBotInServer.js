export default async function getClientServerList() {
  let list;
  await fetch(`/discord-data/client/servers`)
    .then((response) => response.json())
    .then((clientServers) => {
      list = clientServers.clientServersList;
    });
  return list;
}
