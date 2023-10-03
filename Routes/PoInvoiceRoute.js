import express from "express";
const router = express.Router();
import {
  createPoInvoice,
  getInvoicesForPoContractor,
  getSingleInvoice,
} from "../Controllers/poInvoiceController.js";
import { tokenCheckadmin } from "../Middlewares/tokenCheckadmin .js";

router.post("/createInvoiceofpo", tokenCheckadmin, createPoInvoice);
router.get(
  "/getinvoiceofcontractor",
  tokenCheckadmin,
  getInvoicesForPoContractor
);
router.get("/getsingleinvoice", tokenCheckadmin, getSingleInvoice);

export default router;
