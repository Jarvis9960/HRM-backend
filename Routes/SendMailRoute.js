import express from "express";
const router = express.Router();
import {
  getUserConsent,
  microsoftLoginController,
  sendMailFromContractorMail,
} from "../Controllers/SendMailController.js";
import { tokenCheckcontractor } from "../Middlewares/tokenCheckContractor.js";
import multer from "multer";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
let fileName = fileURLToPath(import.meta.url);
let __dirName = dirname(fileName);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirName, "../public/uploads/Invoices"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.originalname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

function checkFileType(file, cb) {
  const filetypes = /csv/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("CSV File only!"); // custom this message to fit your needs
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

router.get("/get-access-token-microsoft", microsoftLoginController);
router.get("/get-user-consent", getUserConsent);
router.post("/send-mail-of-timesheet", upload.single("TimesheetFile"), sendMailFromContractorMail);

export default router;
