import passport, { createSteamStrategy } from "../config/passport.js";

export function steamLogin(req, res, next) {
  const serverId = req.params.serverId;
  createSteamStrategy(serverId); // Create dynamic strategy
  passport.authenticate(`steam-${serverId}`)(req, res, next);
}

export function steamAuthReturn(req, res, next) {
  passport.authenticate(`steam-${req.params.serverId}`, {
    failureRedirect: `/server/${req.params.serverId}`,
    keepSessionInfo: true,
  })(req, res, () => {
    req.session.steamAuthUser = req.user;
    const isMod = req.session.isMod;
    res.redirect(`/server/${req.params.serverId}?isMod=${isMod}`);
  });
}
