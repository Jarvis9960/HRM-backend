import express from "express";
const router = express.Router();
import { createContractor, updatecontractorprofile } from "../Controllers/ContractorController.js";
import { multerUpload } from "../Middlewares/MulterUpload.js";

const multerUploadfiles = multerUpload.fields([{ name: 'actualPanImage'}, { name: 'actualAdharImage'}, { name: 'beneficiaryPanImage'}, { name: 'beneficiaryAadharImage'}])

router.post("/addcontractor", createContractor);
router.post("/updatecontractorprofile", multerUploadfiles, updatecontractorprofile);

export default router;

