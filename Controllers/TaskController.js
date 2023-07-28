import moment from "moment";
import TaskModel from "../Models/TaskModel.js";
import ContractorModel from "../Models/ContractorModel.js"

//Create Task
export const createTask = async (req, res) => {
  try {
    const { date, workingHour, task } = req.body;

    if (!Object.keys(req.body).length > 0) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide details" });
    }
    if (!date) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide date" });
    }
    if (!workingHour) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide workingHour" });
    }
    if (!task) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide task" });
    }

    // Validate the date format
    if (!moment(date, "DD/MM/YYYY", true).isValid()) {
      return res
        .status(400)
        .json({
          status: false,
          message: "Invalid date format. Use DD/MM/YYYY",
        });
    }

    const existContractor = await ContractorModel.findOne({_id: req.user._id});

    if (!existContractor) {
      return res.status(400).json({ status: false, message: "Contractor does not exist" });
    }

    const existingTask = await TaskModel.findOne({
      contractorId: req.user._id,
      date: moment(date, "DD/MM/YYYY").toDate(),
    });
    if (existingTask) {
      return res
        .status(409)
        .json({ status: false, message: "Task for this date already exists" });
    }

    const taskData = {
      contractorId:req.user._id,
      date: moment(date, "DD/MM/YYYY").format(), 
      workingHour,
      task,
    };

    const newTask = await TaskModel.create(taskData);
    res
      .status(201)
      .json({
        status: true,
        message: "Task created successfully",
        data: newTask,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        status: false,
        message: "Something went wrong",
        error: error.message,
      });
  }
};


// getallTasks for Admin
export const getallTasks = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ status: false, message: "Please provide date" });
    }
    const dateFormats = ["DD/MM/YYYY", "MM/YYYY"];
    const parsedDate = moment(date, dateFormats, true);

    if (!parsedDate.isValid()) {
      return res.status(400).json({
        status: false,
        message: "Invalid date format. Use DD/MM/YYYY or MM/YYYY",
      });
    }

    const dateFormats1 = ["MM/YYYY"];
    const parsedDate1 = moment(date, dateFormats1, true);

    const dateFormats2 = ["DD/MM/YYYY"];
    const parsedDate2 = moment(date, dateFormats2, true);

    let tasks;

    if (parsedDate1.isValid()) {
     
       const year = parsedDate.year();
      const month = parsedDate.month();
      const startOfMonth = moment([year, month, 1]).startOf("month");
      const endOfMonth = moment([year, month, 1]).endOf("month");
   
      tasks = await TaskModel.find({
        date: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() },
      });

    } else if(parsedDate2.isValid()) {
      tasks = await TaskModel.find({ date: parsedDate.toDate() });
    }

    if (tasks.length === 0) {
      return res.status(404).json({ status: false, message: "No tasks found for the given date" });
    }

    res.status(200).json({ status: true, data: tasks });
  } catch (error) {
    res.status(500).json({ status: false, message: "Something went wrong", error: error.message });
  }
};

// getownTasks by Contractor
export const getownTasks = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ status: false, message: "Please provide date" });
    }

    const contractorId = req.user._id;

    // Validate the date format (including month and year)
    const dateFormats = ["DD/MM/YYYY", "MM/YYYY"];
    const parsedDate = moment(date, dateFormats, true);
    if (!parsedDate.isValid()) {
      return res.status(400).json({ status: false, message: "Invalid date format. Use DD/MM/YYYY or MM/YYYY" });
    }

    const dateFormats1 = ["MM/YYYY"];
    const parsedDate1 = moment(date, dateFormats1, true);

    const dateFormats2 = ["DD/MM/YYYY"];
    const parsedDate2 = moment(date, dateFormats2, true);

    let tasks;
   if (parsedDate1.isValid()) {

       const year = parsedDate.year();
      const month = parsedDate.month();
      const startOfMonth = moment([year, month, 1]).startOf("month");
      const endOfMonth = moment([year, month, 1]).endOf("month");
      tasks = await TaskModel.find({
        contractorId,
        date: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() },
      }); 

    } else if(parsedDate2.isValid()) {
      
      tasks = await TaskModel.find({ contractorId, date: parsedDate.toDate() });
    }

    if (tasks.length === 0) {
      return res.status(404).json({ status: false, message: 'No tasks found for the given date' });
    }

    res.status(200).json({ status: true, data: tasks });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Something went wrong', error: error.message });
  }
};


