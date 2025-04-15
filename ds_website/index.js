import { join } from "path";
import express from "express";
import session from "express-session";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// const db_connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

multer({ dest: "uploads/" });
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
    resave: true,
    saveUninitialized: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//discord-data route
app.use("/discord-data", discordRoute_GET);
app.use("/discord-data", discordRoute_POST);

//session route
app.use("/session", sessionRoute_GET);
app.use("/session", sessionRoute_POST);

app.use(passport.initialize());
app.use(passport.session());
app.use(steamAuthRoutes);

//App Get
app.get("/", (req, res) => {
  req.session.isLoggedIn = false;
  res.sendFile(join(__dirname, "View/index.html"));
});

app.get("/auth/discord", async (req, res) => {
  req.session.isLoggedIn = true;

  const data = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: "authorization_code",
    code: req.query.code,
    redirect_uri: "https://twdl.app/auth/discord",
  });

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: data,
  });
  const json = await response.json();
  if (!json.access_token) {
    return res.status(400).send("Failed to retrieve access token.");
  }
  req.session.accessToken = json.access_token;
  req.session.tokenType = json.token_type;
  req.session.isLoggedIn = true;

  return res.redirect("/dashboard");
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

app.get("/status", (req, res) => {
  return res.sendFile(join(__dirname, "View/template/status.html"));
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
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
