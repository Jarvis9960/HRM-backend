import express from "express";
const router = express.Router();
import { createContractor, updatecontractorprofile } from "../Controllers/ContractorController.js";

router.post("/addcontractor", createContractor);
router.post("/updatecontractorprofile", updatecontractorprofile);

export default router;

