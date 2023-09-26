import express from "express";
import { tokenCheckadmin } from "../Middlewares/tokenCheckadmin .js";
import { createClient, createPO, getClientForAdmin, getPOOfClients, getSinglePO, updateOrganizationOfOrganization } from "../Controllers/ClientController.js";
const router = express.Router();

router.post("/createClient", tokenCheckadmin, createClient);
router.get("/getallClient", tokenCheckadmin, getClientForAdmin);
router.patch("/updateOrganizationtoclient", tokenCheckadmin, updateOrganizationOfOrganization);
router.get("/getPO's", tokenCheckadmin, getPOOfClients);
router.get("/getsinglePo", tokenCheckadmin, getSinglePO);
router.post("/createPo", tokenCheckadmin, createPO);


export default router;