export default async function r6TrackerAPIConn() {
  await fetch(
    "https://api.tracker.gg/api/v2/r6siege/standard/profile/ubi/Toad-?"
  ).then((response) => {
    console.log(response);
  });
}
