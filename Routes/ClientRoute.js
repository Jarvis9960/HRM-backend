import express from "express";
import { tokenCheckadmin } from "../Middlewares/tokenCheckadmin .js";
import { createClient, createPO, deleteContractorFromPO, getClientForAdmin, getInvoiceData, getPOOfClients, getSinglePO, updateContractorIntoPo, updateOrganizationOfOrganization } from "../Controllers/ClientController.js";
const router = express.Router();

router.post("/createClient", tokenCheckadmin, createClient);
router.get("/getallClient", tokenCheckadmin, getClientForAdmin);
router.patch("/updateOrganizationtofclient", tokenCheckadmin, updateOrganizationOfOrganization);
router.get("/getPO's", tokenCheckadmin, getPOOfClients);
router.get("/getsinglePo", tokenCheckadmin, getSinglePO);
router.post("/createPo", tokenCheckadmin, createPO);
router.patch("/updateContractorintopo", tokenCheckadmin, updateContractorIntoPo);
router.delete("/deletecontractorfrompo", tokenCheckadmin, deleteContractorFromPO);
router.get("/getinvoicedata", getInvoiceData);



export default router;