import moment from "moment";
import schedule from "node-schedule";
import nodemailer from "nodemailer";
import TaskModel from "../Models/TaskModel.js";
import ContractorModel from "../Models/ContractorModel.js";

//Create Task
export const createTask = async (req, res) => {
  try {
    const { date, workingHour, task, organization } = req.body;

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
    if (!organization) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide Organization" });
    }

    // Validate the date format
    if (!moment(date, "DD/MM/YYYY", true).isValid()) {
      return res.status(400).json({
        status: false,
        message: "Invalid date format. Use DD/MM/YYYY",
      });
    }

    const existContractor = await ContractorModel.findOne({
      _id: req.user._id,
    });

    if (!existContractor) {
      return res
        .status(400)
        .json({ status: false, message: "Contractor does not exist" });
    }

    const existingTask = await TaskModel.findOne({
      contractorId: req.user._id,
      organization: organization,
      date: moment(date, "DD/MM/YYYY").toDate(),
    });
    if (existingTask) {
      return res
        .status(409)
        .json({ status: false, message: "Task for this date already exists" });
    }

    const taskData = {
      contractorId: req.user._id,
      organization: organization,
      date: moment(date, "DD/MM/YYYY").format(),
      workingHour,
      task,
    };

    const newTask = await TaskModel.create(taskData);
    return res.status(201).json({
      status: true,
      message: "Task created successfully",
      data: newTask,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// getallTasks for Admin
export const getallTasks = async (req, res) => {
  try {
    const { date, organization } = req.query;

    if (!date) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide date" });
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
        date: {
          organization: organization,
          $gte: startOfMonth.toDate(),
          $lte: endOfMonth.toDate(),
        },
      });
    } else if (parsedDate2.isValid()) {
      tasks = await TaskModel.find({
        organization: organization,
        date: parsedDate.toDate(),
      });
    }

    if (tasks.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No tasks found for the given date" });
    }

    res.status(200).json({ status: true, data: tasks });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// getownTasks by Contractor
export const getownTasks = async (req, res) => {
  try {
    const { date, organization } = req.query;

    if (!date) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide date" });
    }

    const contractorId = req.user._id;

    // Validate the date format (including month and year)
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
        contractorId,
        organization: organization,
        date: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() },
      });
    } else if (parsedDate2.isValid()) {
      tasks = await TaskModel.find({
        contractorId,
        organization: organization,
        date: parsedDate.toDate(),
      });
    }

    if (tasks.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No tasks found for the given date" });
    }

    res.status(200).json({ status: true, data: tasks });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
//Send the email to the contractor
const transporter = nodemailer.createTransport({
  service: "Gmail",
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

// Function to send reminder email
export const sendReminderEmail = async (contractorEmail) => {
  const emailSubject = "Task Reminder";
  const emailText = "You have not scheduled all tasks for the upcoming month.";

  const mailOptions = {
    from: "exactsshubham@gmail.com",
    to: contractorEmail,
    subject: emailSubject,
    text: emailText,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending reminder email:", error);
    } else {
      console.log("Reminder email sent:", info.response);
    }
  });
};

// Schedule the reminder check on the last day of the month
const scheduleReminderCheck = () => {
  const rule = new schedule.RecurrenceRule();
  rule.date = -1; // Last day of the month
  // const rule = new schedule.RecurrenceRule();
  // rule.hour = 15; // 3 PM
  // rule.minute =57;

  const reminderJob = schedule.scheduleJob(rule, async () => {
    const currentDate = moment();
    const nextMonth = currentDate.clone().add(1, "months");
    const contractors = await ContractorModel.find({}); // Fetch all contractors

    for (const contractor of contractors) {
      const contractorTasks = await TaskModel.find({
        contractorId: contractor._id,
        date: {
          $gte: nextMonth.startOf("month").toDate(),
          $lte: nextMonth.endOf("month").toDate(),
        },
      });

      if (contractorTasks.length !== nextMonth.daysInMonth()) {
        sendReminderEmail(contractor.email); // Send reminder email to the contractor
      }
    }
  });
};

// Call the scheduler to set up the reminder check
scheduleReminderCheck();

export const updateTask = async (req, res) => {
  try {
    const { date, workingHour, task, organization } = req.body;

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
    if (!organization) {
      return res
        .status(422)
        .json({ status: false, message: "Please provide organzation" });
    }

    //Vaildate the date format
    if (!moment(date, "DD/MM/YYYY", true).isValid()) {
      return res.staus(400).json({
        status: false,
        message: "Invalid date format. Use DD/MM/YYYY",
      });
    }

    const existContractor = await ContractorModel.findOne({
      _id: req.user._id,
    });

    if (!existContractor) {
      return res
        .status(400)
        .json({ staus: false, message: "Contractor does not exist" });
    }
    let existingTask = await TaskModel.findOne({
      contractorId: req.user._id,
      organization: organization,
      date: moment(date, "DD/MM/YYYY").toDate(),
    });

    if (!existingTask) {
      const taskData = {
        contractorId: req.user._id,
        organization: organization,
        date: moment(date, "DD/MM/YYYY").format(),
        workingHour,
        task,
      };

      existingTask = await TaskModel.create(taskData);

      return res.status(201).json({
        status: true,
        message: "Task Updated successfully",
        data: existingTask,
      });
    }

    //Update the existing task
    existingTask.date = moment(date, "DD/MM/YYYY").format();
    existingTask.organization = organization;
    existingTask.workingHour = workingHour;
    existingTask.task = task;
    await existingTask.save();

    return res.status(200).json({
      status: true,
      message: "Task Updated Successfully",
      date: existingTask,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
