import express from "express";
const sessionRoute_POST = express.Router();
//post
sessionRoute_POST
  .post("/setIsDataFetched", (request, response) => {
    request.session.isDataFetched = true;
    response.json({ message: "Data fetched state updated" });
  })

  .post("/saveToSession", (request, response) => {
    const { key, value } = request.body;
    request.session[key] = value;
    return response.json({ message: "Variable saved to session" });
  });

export default sessionRoute_POST;
