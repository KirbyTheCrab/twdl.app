import express from "express";
const sessionRoute_POST = express.Router();

const SAFE_SESSION_KEYS = new Set(["userId", "isDataFetched", "isMod", "serverPageId"]);

function requireSessionAuth(request, response, next) {
  if (!request.session?.isLoggedIn) {
    return response.status(401).json({ error: "Authentication required" });
  }
  return next();
}

//post
sessionRoute_POST
  .post("/setIsDataFetched", requireSessionAuth, (request, response) => {
    request.session.isDataFetched = true;
    response.json({ message: "Data fetched state updated" });
  })

  .post("/saveToSession", requireSessionAuth, (request, response) => {
    const { key, value } = request.body;
    if (!SAFE_SESSION_KEYS.has(key)) {
      return response.status(400).json({ error: "Session key is not allowed" });
    }
    request.session[key] = value;
    return response.json({ message: "Variable saved to session" });
  });

export default sessionRoute_POST;
