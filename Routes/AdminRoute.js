import express from "express";
const router = express.Router();
import { createAdmin, loginAdmin } from "../Controllers/AdminController.js";
import { createContractor } from "../Controllers/ContractorController.js";
router.post("/create", createAdmin);
router.post("/login", loginAdmin);
router.post("/addContractor", createContractor);

export default router;

