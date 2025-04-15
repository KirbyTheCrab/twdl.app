import passport from "passport";
import { Strategy as SteamStrategy } from "passport-steam";

const createdStrategies = new Set();

export function createSteamStrategy(serverId) {
  if (!createdStrategies.has(serverId)) {
    passport.use(
      `steam-${serverId}`,
      new SteamStrategy(
        {
          returnURL: `https://twdl.app/server/${serverId}/auth/steam/return`,
          realm: `https://twdl.app`,
          apiKey: process.env.SteamAPIKey,
        },
        function (identifier, profile, done, err) {
          return done(err, profile);
        }
      )
    );
    createdStrategies.add(serverId);
  }
}

// Serialize and Deserialize Users
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

export default passport;
