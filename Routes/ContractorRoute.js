import express from "express";
const router = express.Router();
import { createContractor, loginContractor, updatecontractorprofile, getContractor, approveContractor, getdetailsofContractor } from "../Controllers/ContractorController.js";
import { multerUpload } from "../Middlewares/MulterUpload.js";
import { tokenCheckadmin } from "../Middlewares/tokenCheckadmin .js";
import { tokenCheckContractor } from "../Middlewares/tokenCheckContractor.js";

const multerUploadfiles = multerUpload.fields([{ name: 'actualPanImage'}, { name: 'actualAdharImage'}, { name: 'beneficiaryPanImage'}, { name: 'beneficiaryAadharImage'}])

router.post("/addcontractor", tokenCheckadmin, createContractor);
router.get("/getContractor", tokenCheckadmin, getContractor);
router.patch("/approveContractor", tokenCheckadmin, approveContractor);
router.get("/getdetailsofContractor", tokenCheckadmin, getdetailsofContractor);

router.post("/loginContractor", loginContractor)
router.post("/updatecontractorprofile", tokenCheckContractor,  multerUploadfiles, updatecontractorprofile);


export default router;

