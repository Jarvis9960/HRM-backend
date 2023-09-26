import express from "express";
import { tokenCheckadmin } from "../Middlewares/tokenCheckadmin .js";
import { createClient, getClientForAdmin, updateOrganizationOfOrganization } from "../Controllers/ClientController.js";
const router = express.Router();

router.post("/createClient", tokenCheckadmin, createClient);
router.get("/getallClient", tokenCheckadmin, getClientForAdmin);
router.patch("/updateOrganizationtoclient", tokenCheckadmin, updateOrganizationOfOrganization);


export default router;