import ClientSettings from "../clientSettings/clientSettings.js";
import GuildSettings from "../guildSettings/guildSettings.js";
import ReactionRoles from "../reaction-role/reaction-role.js";
import WelcomeMessage from "../welcomeMessage/welcomeMessage.js";
import Cs2Api from "../cs2Api/cs2Api.js";
export default class FetchSettingPages {
  constructor() {
    this.clientSettings = document.getElementById("clientSettings");
    this.serverSettings = document.getElementById("serverSettings");
    this.reactionRoles = document.getElementById("reactionRoles");
    this.welcomeMessage = document.getElementById("welcomeMessage");
    this.r6api = document.getElementById("r6api");
    this.wowapi = document.getElementById("wowapi");
    this.cs2api = document.getElementById("cs2api");
  }

  //template caching
  async templateCaching(templatePath) {
    const templateCache = window.templateCache || (window.templateCache = {});
    if (templateCache[templatePath]) {
      return templateCache[templatePath];
    }
    const response = await fetch(`/template${templatePath}`);
    const html = await response.text();
    templateCache[templatePath] = html; //cache loaded template
    return html;
  }

  async loadHtmlTemplate(page) {
    const template = await this.templateCaching(page);
    const dynamicPageLoader = document.getElementById("dynamic-page");
    dynamicPageLoader.classList.add(`${page}`);
    dynamicPageLoader.innerHTML = template;
  }

  loadScriptOnce(src) {
    if (!document.querySelector(`script[src="${src}"]`)) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = src;
      document.head.append(script);
      script.onload = () => {
        console.log("Script loaded");
      };
    } else {
      console.log("Script already loaded");
    }
  }

  async initialiseEventListeners(serverInfoPage) {
    const isMod = await fetch("/session/isMod")
      .then((res) => res.json())
      .then((data) => data.isMod);

    if (!isMod) {
      document.getElementById("adminPanel").remove();
    }
    if (isMod) {
      this.reactionRoles.addEventListener("click", async () => {
        await this.loadHtmlTemplate("/server-page/reactionRoles.html");
        const reactionRolesSub = document.getElementById("reactionRolesSub");
        const pollSub = document.getElementById("pollSub");

        reactionRolesSub.addEventListener("click", async () => {
          await this.loadHtmlTemplate(
            "/server-page/reactionRoles/giveRole.html"
          );
          new ReactionRoles();
          this.loadScriptOnce("/js/server-page/reaction-role/reaction-role.js");
        });

        pollSub.addEventListener("click", async () => {
          await this.loadHtmlTemplate("/server-page/reactionRoles/poll.html");
        });
      });

      //Server Settings
      this.serverSettings.addEventListener("click", async () => {
        await this.loadHtmlTemplate("/server-page/serverSettings.html");
        new GuildSettings(serverInfoPage);
        this.loadScriptOnce("/js/server-page/guildSettings/guildSettings.js");
      });

      //Client Settings
      this.clientSettings.addEventListener("click", async () => {
        await this.loadHtmlTemplate("/server-page/clientSettings.html");
        new ClientSettings(serverInfoPage);
        this.loadScriptOnce("/js/server-page/clientSettings/clientSettings.js");
      });

      //Welcome Message
      this.welcomeMessage.addEventListener("click", async () => {
        await this.loadHtmlTemplate("/server-page/welcomeMessage.html");
        new WelcomeMessage();
      });
    }
    //R6 API
    this.r6api.addEventListener("click", async () => {
      // await this.loadHtmlTemplate("/server-page/r6api.html");
      // new r6Tracker();
    });

    //WOW API
    this.wowapi.addEventListener("click", async () => {
      await this.loadHtmlTemplate("/server-page/wowapi.html");
    });

    //CS2 API
    this.cs2api.addEventListener("click", async () => {
      await this.loadHtmlTemplate("/server-page/cs2/cs2api.html");
      new Cs2Api();
    });
  }
}
