export default class User {
  userId;
  userName;
  userAvatar;
  async fetchUserData(tokenType, accessToken) {
    const dashboardHeader = document.getElementById("dashboard-header");
    await fetch("https://discord.com/api/users/@me", {
      headers: {
        authorization: `${tokenType} ${accessToken}`,
      },
    })
      .then((result) => result.json())
      .then(async (response) => {
        //create div
        const profileCard = document.getElementById("user-card");
        const { username, discriminator, avatar, id } = response;

        this.userId = id;
        this.userName = username;
        this.discriminator = discriminator;
        this.userAvatar = avatar;

        await fetch("/session/saveToSession", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "userId", value: id }),
        });

        //create paragraph and assign user name
        let userName = document.createElement("p");
        userName.innerText = ` ${username}`;
        userName.classList.add("user-name");

        //create image and assign user profile
        let userProfile = document.createElement("img");
        userProfile.src = `https://cdn.discordapp.com/avatars/${id}/${avatar}.jpg`;
        const userIconJpg = userProfile.src.split("/").pop(); // This will return "null.jpg"
        if (userIconJpg === "null.jpg") {
          userProfile.src = "/img/discord-default-green.png";
        }

        userProfile.classList.add("user-icon");
        profileCard.classList.add("profile-card");

        //Append body > header > div > username, userprofile
        profileCard.appendChild(userName);
        profileCard.appendChild(userProfile);
        dashboardHeader.appendChild(profileCard);
      })
      .catch(console.error);
  }
  getUserId() {
    return this.userId;
  }
  getUserName() {
    return this.userName;
  }
  getUserAvatar() {
    return this.userAvatar;
  }
}
