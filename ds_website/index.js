import { join } from "path";
import express from "express";
import session from "express-session";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { promises as fs } from "node:fs";
import dotenv from "dotenv";
import crypto from "node:crypto";
import client from "../ds bot/main.js";
// import mysql from "mysql";
import multer from "multer";
import passport from "./config/passport.js";
import steamAuthRoutes from "./Routes/steamAuth.js";
import helmet from "helmet";

/**
 * Routes
 * GET routes
 */
import discordRoute_GET from "./Routes/get/discordRouter.js";
import sessionRoute_GET from "./Routes/get/sessionRouter.js";

/**
 * POST routes
 */
import sessionRoute_POST from "./Routes/post/sessionRouter.js";
import discordRoute_POST from "./Routes/post/discordRouter.js";

dotenv.config();
const app = express();
const port = process.env.PORT;
const isProduction = process.env.NODE_ENV === "production";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const webProcessStartedAt = Date.now();

async function countJsFilesRecursive(directoryPath) {
  try {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    let total = 0;

    for (const entry of entries) {
      const fullPath = join(directoryPath, entry.name);
      if (entry.isDirectory()) {
        total += await countJsFilesRecursive(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".js")) {
        total += 1;
      }
    }

    return total;
  } catch {
    return 0;
  }
}

function getBotMemberEstimate() {
  try {
    return client.guilds.cache.reduce(
      (total, guild) => total + (guild.memberCount || 0),
      0
    );
  } catch {
    return 0;
  }
}
// const db_connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

multer({ dest: "uploads/" });
app.set("trust proxy", 1);
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://cdn.discordapp.com/", "https://steamstatic.com/", "https://community.fastly.steamstatic.com/", "https://avatars.steamstatic.com/", "https://steamcommunity-a.akamaihd.net/"],
      connectSrc: ["'self'", "https://discord.com/api/", "https://api.steampowered.com/", "https://steamcommunity.com/", "https://cdn.jsdelivr.net"],
      scriptSrcAttr: ["'unsafe-inline'"],
      frameAncestors: ["'none'"],
      formAction: ["*"]
    },
  })
);

app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true,
}));

app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.noSniff());
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));
app.use("/Model", express.static(join(__dirname, "Model/")));
app.use(express.static(join(__dirname, "public")));
app.use(express.static(join(__dirname, "src")));
app.use("/template", express.static(join(__dirname, "View/template")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "twdl.sid",
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//discord-data route
app.use("/discord-data", isAuthenticated, discordRoute_GET);
app.use("/discord-data", isAuthenticated, discordRoute_POST);

//session route
app.use("/session", sessionRoute_GET);
app.use("/session", sessionRoute_POST);

app.use(passport.initialize());
app.use(passport.session());
app.use(steamAuthRoutes);

//App Get
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "View/index.html"));
});

app.get("/inspect-item", (req, res) => {
  res.sendFile(join(__dirname, "View/template/inspectItem.html"));
})

app.get("/auth/discord", async (req, res) => {
  const code = req.query.code;
  if (typeof code !== "string" || !code.length) {
    return res.status(400).send("Invalid authorization code.");
  }

  try {
    const data = new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: "http://localhost:53134/auth/discord",
    });

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: data,
    });

    const json = await tokenResponse.json();
    if (!json.access_token) {
      return res.status(400).send("Failed to retrieve access token.");
    }

    req.session.regenerate((error) => {
      if (error) {
        return res.status(500).send("Failed to start user session.");
      }
      req.session.accessToken = json.access_token;
      req.session.tokenType = json.token_type;
      req.session.isLoggedIn = true;
      req.session.isDataFetched = false;
      req.session.oauthNonce = crypto.randomUUID();
      return res.redirect("/dashboard");
    });
  } catch (error) {
    console.error("Discord OAuth callback failed", error);
    return res.status(500).send("Unable to complete login right now.");
  }
});

app.get("/dashboard", isAuthenticated, (req, res) => {
  req.session.isDataFetched = false;
  return res.sendFile(join(__dirname, "View/template/dashboard.html"));
});

app.get("/user-not-logged-in", (req, res) => {
  return res.sendFile(join(__dirname, "View/template/user-not-logged-in.html"));
});

app.get("/auth/check", isAuthenticated, (req, res) => {
  res.json({ authenticated: true });
});

// Middleware to check if user is logged in
export default function isAuthenticated(req, res, next) {
  if (req.session.isLoggedIn) {
    return next();
  } else {
    return res.redirect("/user-not-logged-in");
  }
}
app.get("/privacyPolicy", (req, res) => {
  return res.sendFile(join(__dirname, "View/template/privacyPolicy.html"))
});

app.get("/termsOfUse", (req, res) => {
  return res.sendFile(join(__dirname, "View/template/tnc.html"))
})
app.get("/status", (req, res) => {
  return res.sendFile(join(__dirname, "View/template/status.html"));
});

app.get("/api/status/metrics", async (req, res) => {
  const [commandCount, eventCount] = await Promise.all([
    countJsFilesRecursive(join(__dirname, "../ds bot/commands")),
    countJsFilesRecursive(join(__dirname, "../ds bot/events")),
  ]);

  const websiteUptimeSeconds = Math.floor(process.uptime());
  const botUptimeSeconds =
    typeof client.uptime === "number" ? Math.floor(client.uptime / 1000) : null;
  const memory = process.memoryUsage();

  const payload = {
    generatedAt: new Date().toISOString(),
    website: {
      online: true,
      uptimeSeconds: websiteUptimeSeconds,
      processStartedAt: new Date(webProcessStartedAt).toISOString(),
      nodeVersion: process.version,
      platform: `${process.platform}/${process.arch}`,
      memoryRssMb: Number((memory.rss / 1024 / 1024).toFixed(1)),
      heapUsedMb: Number((memory.heapUsed / 1024 / 1024).toFixed(1)),
    },
    bot: {
      online: typeof client.isReady === "function" ? client.isReady() : Boolean(client.readyAt),
      uptimeSeconds: botUptimeSeconds,
      latencyMs: Number.isFinite(client.ws?.ping) ? client.ws.ping : null,
      guildCount: client.guilds.cache.size,
      memberCount: getBotMemberEstimate(),
      cachedUserCount: client.users.cache.size,
      commandCount,
      eventCount,
    },
  };

  return res.json(payload);
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("twdl.sid");
    return res.redirect("/");
  });
});

app.get(`/server/:serverId`, isAuthenticated, (req, res) => {
  const serverId = req.params.serverId;
  req.session.serverPageId = serverId;
  return res.sendFile(join(__dirname, "View/template/server.html"));
});

// db_connection.connect((error) => {
//   if (error) {
//     console.error("Unable to connect to database " + error);
//   }
// });

app.listen(port, async () => {
  console.log(`Apps listening at http://localhost:${port}`);
});
