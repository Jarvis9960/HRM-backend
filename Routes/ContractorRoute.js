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
  contractorResetPassword,
  reupdateContractorProfile,
  updateOrganizationInProfile,
  deleteOrganizationFromContractor,
} from "../Controllers/ContractorController.js";

import { storage, checkFileType } from "../Middlewares/multerMiddleware.js";
import { tokenCheckadmin } from "../Middlewares/tokenCheckadmin .js";
import { tokenCheckcontractor } from "../Middlewares/tokenCheckContractor.js";
import multer from "multer";

const maxSize = 5 * 1024 * 1024; // 5MB (in bytes)

const multerUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, cb) {
    checkFileType(file, (error, isAllowed) => {
      if (error) {
        return cb(error);
      }
      if (isAllowed) {
        if (file.size <= maxSize) {
          cb(null, true);
        } else {
          cb(new Error("File size exceeds the 5MB limit"));
        }
      } else {
        cb(new Error("Invalid file type"));
      }
    });
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
router.get("/searchContractors", tokenCheckadmin, searchContractors);

router.post("/loginContractor", loginContractor);
router.post(
  "/updatecontractorprofile",
  tokenCheckcontractor,
  multerUploadfiles,
  updatecontractorprofile
);
router.get("/getownDetails", tokenCheckcontractor, getowndetailsofContractor);
router.post("/contractorForgotPassword", contractorForgotPassword);
router.post(
  "/contractorResetPassword/:resetPassToken",
  contractorResetPassword
);
router.patch(
  "/reupdatedProfile",
  tokenCheckcontractor,
  multerUploadfiles,
  reupdateContractorProfile
);
router.patch("/addorganization", tokenCheckadmin, updateOrganizationInProfile);
router.delete(
  "/deleteorganization",
  tokenCheckadmin,
  deleteOrganizationFromContractor
);
export default router;
