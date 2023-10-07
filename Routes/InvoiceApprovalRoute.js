import express from "express";
const router = express.Router();
import { approveInvoice, createInvoiceApproval, getApprovedInvoiceofContractor, getPendingInvoice } from "../Controllers/InvoiceControllers.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import multer from "multer";
import { tokenCheckcontractor } from "../Middlewares/tokenCheckcontractor.js";
import { tokenCheckadmin } from "../Middlewares/tokenCheckadmin .js"

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

const invoiceApprovalFile = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

router.post(
  "/createinvoiceapproval",
  // tokenCheckcontractor,
  invoiceApprovalFile.single("ApprovalSS"),
  createInvoiceApproval
);
router.get("/getinvoicesforcontractor", tokenCheckcontractor, getApprovedInvoiceofContractor);
router.get("/getpendinginvoiceforcontractor", tokenCheckcontractor, getPendingInvoice);
router.patch("/approveinvoice", tokenCheckadmin, approveInvoice);
router.get("/getapprovedinvoicedforadmin", tokenCheckadmin, getApprovedInvoiceofContractor);
router.get("/getpendinginvoiceforadmin", tokenCheckadmin, getPendingInvoice);

export default router;
