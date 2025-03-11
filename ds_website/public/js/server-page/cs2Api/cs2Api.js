export default class Cs2Api {
  constructor() {
    this.steamAuth();
  }

  async steamAuth() {
    const pathParts = window.location.pathname.split("/");
    const serverId = pathParts[2];
    document.getElementById(
      "steamApiConnect"
    ).action = `/server/${serverId}/auth/steam`;
  }
}
