import express from "express";
const router = express.Router();

import { tokenCheckadmin } from "../Middlewares/tokenCheckadmin .js";
import { tokenCheckcontractor } from "../Middlewares/tokenCheckcontractor.js";
import { createTask, getallTasks, getownTasks, updateTask } from "../Controllers/TaskController.js";
// Create a task for a particular date
router.post('/createTask', tokenCheckcontractor, createTask);

// Get saved tasks for a particular date
router.get("/getallTasks", tokenCheckadmin, getallTasks);
router.get("/getTasks", tokenCheckcontractor, getownTasks);
router.patch("/updateTask", tokenCheckcontractor, updateTask);

export default router;