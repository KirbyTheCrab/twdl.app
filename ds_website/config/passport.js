import passport from "passport";
import { Strategy as SteamStrategy } from "passport-steam";

const createdStrategies = new Set();

export function createSteamStrategy(serverId) {
  if (!createdStrategies.has(serverId)) {
    passport.use(
      `steam-${serverId}`,
      new SteamStrategy(
        {
          returnURL: `http://localhost:53134/server/${serverId}/auth/steam/return`,
          realm: `http://localhost:53134`,
          apiKey: process.env.SteamAPIKey,
        },
        function (identifier, profile, done) {
          return done(null, profile);
        }
      )
    );
    createdStrategies.add(serverId);
  }
}

// Serialize and Deserialize Users
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

export default passport;
