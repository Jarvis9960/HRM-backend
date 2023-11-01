import express from "express";
const router = express.Router();
import {
  approveInvoice,
  createInvoiceApproval,
  getApprovedInvoiceofContractor,
  getPendingInvoice,
  getSingleApprovedInvoice,
} from "../Controllers/InvoiceControllers.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import multer from "multer";
import { tokenCheckcontractor } from "../Middlewares/tokenCheckContractor.js";
import { tokenCheckadmin } from "../Middlewares/tokenCheckadmin .js";

const fileName = fileURLToPath(import.meta.url);
const __dirname = dirname(fileName);

export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads/approval"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.originalname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

export function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Images only!"); // custom this message to fit your needs
  }
}

const maxSize = 5 * 1024 * 1024; // 5MB (in bytes)

const invoiceApprovalFile = multer({
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

router.post(
  "/createinvoiceapproval",
  tokenCheckcontractor,
  invoiceApprovalFile.single("ApprovalSS"),
  createInvoiceApproval
);
router.get(
  "/getinvoicesforcontractor",
  tokenCheckcontractor,
  getApprovedInvoiceofContractor
);
router.get(
  "/getpendinginvoiceforcontractor",
  tokenCheckcontractor,
  getPendingInvoice
);
router.patch("/approveinvoice", tokenCheckadmin, approveInvoice);
router.get(
  "/getapprovedinvoicedforadmin",
  tokenCheckadmin,
  getApprovedInvoiceofContractor
);
router.get("/getpendinginvoiceforadmin", tokenCheckadmin, getPendingInvoice);
router.get(
  "/getsingleapprovedinvoice",
  tokenCheckcontractor,
  getSingleApprovedInvoice
);
router.get(
  "/getsingleapprovedinvoiceadmin",
  tokenCheckadmin,
  getSingleApprovedInvoice
);

export default router;
