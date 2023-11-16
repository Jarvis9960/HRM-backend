import express from "express";
import { tokenCheckadmin } from "../Middlewares/tokenCheckadmin .js";
import { getNotificationForAdmin, getNotificationforContractors } from "../Controllers/NotificationController.js";
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

export default router;
