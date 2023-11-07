import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDb from "./Database/connectDB.js";
dotenv.config({ path: path.resolve("./config.env") });
import adminRoute from "./Routes/AdminRoute.js";
import contractorRoute from "./Routes/ContractorRoute.js";
import cookieParser from "cookie-parser";
import timesheetRoute from "./Routes/TimesheetRoute.js";
import SendMailRoute from "./Routes/SendMailRoute.js";
import ClientRoute from "./Routes/ClientRoute.js";
import PoInvoiceRoute from "./Routes/PoInvoiceRoute.js";
import InvoiceApprovalRoute from "./Routes/InvoiceApprovalRoute.js";
import OurOwnOrganizationRoute from "./Routes/ourOrganizationRoute.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import http from "http";
import { Server } from "socket.io";
import eventEmitter from "./Utils/eventEmitter.js";
import NotificationModel from "./Models/Notification.js";
import AdminModel from "./Models/AdminModel.js";

const app = express();
const server = http.createServer(app);

const fileName = fileURLToPath(import.meta.url);
const __dirname = dirname(fileName);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4000",
  "http://localhost:5000",
  "http://localhost:6000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:4000",
  "https://driven-utility-403612.el.r.appspot.com",
  "https://admin-portal-403714.el.r.appspot.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  },
});

// database connection function
connectDb()
  .then((res) => {
    console.log("connection to database is successfull");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/api", adminRoute);
app.use("/api", contractorRoute);
app.use("/api", timesheetRoute);
app.use("/api", SendMailRoute);
app.use("/api", ClientRoute);
app.use("/api", PoInvoiceRoute);
app.use("/api", InvoiceApprovalRoute);
app.use("/api", OurOwnOrganizationRoute);

//  socket io connection code
io.on("connection", async (socket) => {
  console.log("connection is successfull to socket");

  eventEmitter.on("contractorupdate", async (data) => {
    const getAllAdmin = await AdminModel.find();

    const notifications = getAllAdmin.map((admin) => ({
      Message: data.message,
      Profile: [
        { type: "Admin", ref: admin._id },
        { type: "Contractor", ref: data.profile._id },
      ],
    }));

    // Create an array of notifications for all admin users
    const createdNotifications = await NotificationModel.create(notifications);

    socket.emit("contractorupdatetoadmin", data);
  });

  eventEmitter.on("Contractoraddinvoice", (data) => {
    console.log(data);
    socket.emit("contractoraddinvoicetoadmin", data);
  });
});

// app to listen on port function
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});
