import express from "express";
const router = express.Router();
import { createAdmin, loginAdmin, forgotPassword, resetPassword } from "../Controllers/AdminController.js";

router.post("/create", createAdmin);
router.post("/login", loginAdmin);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:resetPassToken", resetPassword);

export default router;

