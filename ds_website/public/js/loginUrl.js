fetch("/api/config/login-url")
    .then(res => res.json())
    .then(({ loginUrl, botInviteUrl }) => {
        document.getElementById("loginBtn").href = loginUrl;
        document.getElementById("inviteBtn").href = botInviteUrl;
    });