import express from "express";
const router = express.Router();
import { createContractor, loginContractor, updatecontractorprofile, getContractor } from "../Controllers/ContractorController.js";
import { multerUpload } from "../Middlewares/MulterUpload.js";

const multerUploadfiles = multerUpload.fields([{ name: 'actualPanImage'}, { name: 'actualAdharImage'}, { name: 'beneficiaryPanImage'}, { name: 'beneficiaryAadharImage'}])

router.post("/addcontractor", createContractor);
router.post("/loginContractor", loginContractor)
router.post("/updatecontractorprofile", multerUploadfiles, updatecontractorprofile);
router.get("/getContractor", getContractor);

export default router;

