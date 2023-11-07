import express from "express";
import { tokenCheckadmin } from "../Middlewares/tokenCheckadmin .js";
import { getNotificationForAdmin } from "../Controllers/NotificationController.js";
const router = express.Router();

router.get(
  "/getNotificationforadmin",
  tokenCheckadmin,
  getNotificationForAdmin
);

export default router;
