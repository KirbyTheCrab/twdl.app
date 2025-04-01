import express from "express";
import { steamLogin, steamAuthReturn } from "../Controller/steamController.js";

const router = express.Router();

router.get("/server/:serverId/auth/steam", steamLogin);
router.get("/server/:serverId/auth/steam/return", steamAuthReturn);

export default router;
