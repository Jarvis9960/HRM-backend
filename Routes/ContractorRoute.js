import express from "express";
const router = express.Router();
import { createContractor, loginContractor, updatecontractorprofile, getContractor } from "../Controllers/ContractorController.js";

router.post("/addcontractor", createContractor);
router.post("/loginContractor", loginContractor)
router.post("/updatecontractorprofile", updatecontractorprofile);
router.get("/getContractor", getContractor);

export default router;

