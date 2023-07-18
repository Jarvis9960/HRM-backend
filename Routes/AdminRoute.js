import express from "express";
const router = express.Router();
import { createAdmin, loginAdmin } from "../Controllers/AdminController.js";

router.post("/create", createAdmin)
router.post("/login", loginAdmin);

export default router;

