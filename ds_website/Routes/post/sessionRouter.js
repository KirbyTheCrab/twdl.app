import express from "express";
const sessionRoute_POST = express.Router();
//post
sessionRoute_POST
  .post("/setIsDataFetched", (request, response) => {
    request.session.isDataFetched = true;
    response.json({ message: "Data fetched state updated" });
  })

  .post("/setAccessToken", (request, response) => {
    const { accessToken } = request.body;
    request.session.accessToken = accessToken;
    return response.json({ message: "Access token was set" });
  })

  .post("/setUserId", (request, response) => {
    const { userId } = request.body;
    request.session.userId = userId;
    return response.json({ message: "User ID was set" });
  });

export default sessionRoute_POST;
