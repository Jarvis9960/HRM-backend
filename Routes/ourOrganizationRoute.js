import express from "express";
const router = express.Router();
import { createOurOrganization, getOurOwnOrganization } from "../Controllers/OurorganizationController.js";
import { tokenCheckadmin } from "../Middlewares/tokenCheckadmin .js";



router.post("/createourownorganization", tokenCheckadmin, createOurOrganization);
router.get("/getourownorgnization", tokenCheckadmin, getOurOwnOrganization);



export default router;