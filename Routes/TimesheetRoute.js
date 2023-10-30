import express from "express";
const router = express.Router();

import { tokenCheckadmin } from "../Middlewares/tokenCheckadmin .js";
import { tokenCheckcontractor } from "../Middlewares/tokenCheckContractor.js";
import {
  createTask,
  getallTasks,
  getownTasks,
  getownTasksAdmin,
  updateTask,
} from "../Controllers/TaskController.js";
// Create a task for a particular date
router.post("/createTask", tokenCheckcontractor, createTask);

// Get saved tasks for a particular date
router.get("/getallTasks", tokenCheckadmin, getallTasks);
router.get("/getTasks", tokenCheckcontractor, getownTasks);
router.get("/gettaskforadmin", tokenCheckadmin, getownTasksAdmin);
router.patch("/updateTask", tokenCheckcontractor, updateTask);

export default router;
