import express from "express";
const router = express.Router();
import { getUserConsent, microsoftLoginController, sendMailFromContractorMail } from "../Controllers/SendMailController.js"
import { tokenCheckcontractor } from "../Middlewares/tokenCheckcontractor.js";


router.get("/get-access-token-microsoft", microsoftLoginController);
router.get("/get-user-consent", getUserConsent);
router.post("/send-mail-of-timesheet", sendMailFromContractorMail)


export default router;