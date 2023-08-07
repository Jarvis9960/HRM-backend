import express from "express";
const router = express.Router();
import {
  createContractor,
  loginContractor,
  updatecontractorprofile,
  getContractor,
  approveContractor,
  getdetailsofContractor,
  searchContractors,
  getowndetailsofContractor,
  declineContractor,
  contractorForgotPassword,
  contractorResetPassword
} from "../Controllers/ContractorController.js";

import { storage, checkFileType } from "../Middlewares/multerMiddleware.js";
import { tokenCheckadmin } from "../Middlewares/tokenCheckadmin .js";
import { tokenCheckcontractor } from "../Middlewares/tokenCheckcontractor.js";
import multer from "multer";

const multerUpload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

const multerUploadfiles = multerUpload.fields([
  { name: "actualPanImage" },
  { name: "actualAdharImage" },
  { name: "beneficiaryPanImage" },
  { name: "beneficiaryAadharImage" },
]);

router.post("/addcontractor", tokenCheckadmin, createContractor);
router.get("/getContractor", tokenCheckadmin, getContractor);
router.patch("/approveContractor", tokenCheckadmin, approveContractor);
router.patch("/declineContractor", tokenCheckadmin, declineContractor);
router.get("/getdetailsofContractor", tokenCheckadmin, getdetailsofContractor);
router.get("/searchContractors", tokenCheckadmin, searchContractors)

router.post("/loginContractor", loginContractor);
router.post(
  "/updatecontractorprofile",
  tokenCheckcontractor,
  multerUploadfiles,
  updatecontractorprofile
);
router.get("/getownDetails", tokenCheckcontractor, getowndetailsofContractor);
router.post("/contractorForgotPassword", contractorForgotPassword);
router.post("/contractorResetPassword/:resetPassToken", contractorResetPassword)

export default router;
