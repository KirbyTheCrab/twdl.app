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
  });

export default sessionRoute_GET;
