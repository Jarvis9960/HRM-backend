import express from "express";
const router = express.Router();
import {
  createOurOrganization,
  getOurOwnOrganization,
  getAllOwnOrganization,
} from "../Controllers/OurorganizationController.js";
import { tokenCheckadmin } from "../Middlewares/tokenCheckadmin .js";

router.post(
  "/createourownorganization",
  tokenCheckadmin,
  createOurOrganization
);
router.get("/getourownorgnization", tokenCheckadmin, getOurOwnOrganization);
router.get(
  "/getownorganizationindropdown",
  tokenCheckadmin,
  getAllOwnOrganization
);

export default router;
