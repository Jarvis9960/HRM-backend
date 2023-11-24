import express from "express";
import { tokenCheckadmin } from "../Middlewares/tokenCheckadmin .js";
import {
  getNotificationForAdmin,
  getNotificationforContractors,
  makeIconReadAdmin,
  makeNotificationRead,
} from "../Controllers/NotificationController.js";
import { tokenCheckcontractor } from "../Middlewares/tokenCheckContractor.js";
const router = express.Router();

router.get(
  "/getNotificationforadmin",
  tokenCheckadmin,
  getNotificationForAdmin
);
router.get(
  "/getNotificationforContractor",
  tokenCheckcontractor,
  getNotificationforContractors
);
router.patch("/makenotificationread", tokenCheckadmin, makeNotificationRead);
router.patch("/makeiconreadadmin", tokenCheckadmin, makeIconReadAdmin)

export default router;
