import express from "express";
const sessionRoute_GET = express.Router();

sessionRoute_GET
  .get("/isLoggedIn", (request, response) => {
    response.json({ isLoggedIn: request.session.isLoggedIn || false });
  })
  .get("/isDataFetched", (request, response) => {
    response.json({ isDataFetched: request.session.isDataFetched || false });
  })
  .get("/accessToken", (request, response) => {
    response.json({ accessToken: request.session.accessToken || false });
  })

  .get("/tokenType", (request, response) => {
    response.json({ tokenType: request.session.tokenType } || false);
  })
  .get("/steamAuthUser", (request, response) => {
    response.json({ steamAuthUser: request.session.steamAuthUser } || false);
  })
  .get("/isMod", (request, response) => {
    response.json({ isMod: request.session.isMod } || false);
  })

  .get("/userId", (request, response) => {
    response.json({ userId: request.session.userId });
  })

  .get("/serverPageId", (request, response) => {
    response.json({ serverPageId: request.session.serverPageId });
  });

export default sessionRoute_GET;
