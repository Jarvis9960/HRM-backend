import express from "express";
const router = express.Router();
import {
  createAdmin,
  loginAdmin,
  forgotPassword,
  resetPassword,
  addOrganizationToContratorProfile,
} from "../Controllers/AdminController.js";
import { tokenCheckadmin } from "../Middlewares/tokenCheckadmin .js";

router.post("/create", createAdmin);
router.post("/login", loginAdmin);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:resetPassToken", resetPassword);
router.patch(
  "/addorganizationtocontrator",
  tokenCheckadmin,
  addOrganizationToContratorProfile
);

export default router;
