import express from "express";
const sessionRoute_GET = express.Router();

function requireSessionAuth(request, response, next) {
  if (!request.session?.isLoggedIn) {
    return response.status(401).json({ error: "Authentication required" });
  }
  return next();
}

sessionRoute_GET
  .get("/isLoggedIn", (request, response) => {
    response.json({ isLoggedIn: request.session.isLoggedIn || false });
  })
  .get("/isDataFetched", (request, response) => {
    response.json({ isDataFetched: request.session.isDataFetched || false });
  })
  .get("/accessToken", requireSessionAuth, (request, response) => {
    response.json({ accessToken: request.session.accessToken || false });
  })

  .get("/tokenType", requireSessionAuth, (request, response) => {
    response.json({ tokenType: request.session.tokenType } || false);
  })
  .get("/steamAuthUser", requireSessionAuth, (request, response) => {
    response.json({ steamAuthUser: request.session.steamAuthUser } || false);
  })
  .get("/isMod", requireSessionAuth, (request, response) => {
    response.json({ isMod: request.session.isMod } || false);
  })

  .get("/userId", requireSessionAuth, (request, response) => {
    response.json({ userId: request.session.userId });
  })

  .get("/serverPageId", requireSessionAuth, (request, response) => {
    response.json({ serverPageId: request.session.serverPageId });
  });

export default sessionRoute_GET;
