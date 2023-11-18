import moment from "moment";
import InvoiceApprovalModel from "../Models/InvoiceApproval.js";
import { bucket, bucketName } from "../Utils/googleStorage.js";
import eventEmitter from "../Utils/eventEmitter.js";
import AdminModel from "../Models/AdminModel.js";
import NotificationModel from "../Models/Notification.js";

export const createInvoiceApproval = async (req, res) => {
  try {
    const { amount, month, year, clientId } = req.body;

    if (!amount || !month || !year) {
      return res.status(422).json({
        status: false,
        message: "Please provide all the required field",
      });
    }

    const approvalScreenshot = req.file;
    const fileName = approvalScreenshot.originalname;
    let filePath;

    if (!approvalScreenshot) {
      return res.status(422).json({
        status: false,
        message: "Approval screenshot has not been submitted",
      });
    }

    const blob = bucket.file(approvalScreenshot.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on("error", (err) => {
      console.log("Error uploading file: " + err);

      return res.status(500).json({
        status: false,
        message: "Error uploading approval screenshot",
        error: err,
      });
    });

    blobStream.on("finish", async () => {
      console.log("File uploaded!");

      const invoiceDate = moment({ year, month: month - 1 }) // Subtract 1 from the month number since moment.js months are 0-based (0 for January)
        .add(1, "month") // Add one month to the date
        .toDate(); // Convert the moment object to a JavaScript Date object

      const imageInfo = await bucket.file(fileName);

      imageInfo
        .get()
        .then(async (resp) => {
          filePath = `${resp[0].storage.apiEndpoint}/${resp[0].bucket.id}/${resp[0].id}`;

          const newInvoiceApproval = new InvoiceApprovalModel({
            contractorId: req.user._id,
            clientId: clientId,
            amount: amount,
            InvoiceMonth: invoiceDate,
            ApprovalScreenshot: filePath,
          });

          const savedResponse = await newInvoiceApproval.save();

          if (savedResponse) {
            const getAllAdmin = await AdminModel.find();

            const message = `${req.user.first_name} ${req.user.last_name} has just applied for invoice.`;

            const notifications = getAllAdmin.map((admin) => ({
              Message: message,
              Profile: [
                { type: "Admin", ref: admin._id },
                { type: "Contractor", ref: req.user._id },
              ],
              NotificationFor: "Admin"
            }));

            // Create an array of notifications for all admin users
            const createdNotifications = await NotificationModel.create(
              notifications
            );

            eventEmitter.emit("Contractoraddinvoice", createdNotifications);
            return res.status(202).json({
              status: true,
              message: "Successfully created invoice approval",
            });
          }
        })
        .catch((err) => {
          throw new Error("Cannot Get Image in bucket");
        });
    });

    blobStream.end(approvalScreenshot.buffer);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getApprovedInvoiceofContractor = async (req, res) => {
  try {
    const { contractorId } = req.query;
    const page = req.query.page || 1;
    const limit = 9;

    if (!contractorId) {
      return res.status(422).json({
        status: false,
        message: "Please provide all the required field properly",
      });
    }

    const totalInvoice = await InvoiceApprovalModel.find({
      contractorId: contractorId,
      isApproved: true,
      isPending: false,
      isReject: false,
    }).countDocuments();
    const totalPage = Math.ceil(totalInvoice / limit);

    const getInvoice = await InvoiceApprovalModel.find({
      contractorId: contractorId,
      isApproved: true,
      isPending: false,
      isReject: false,
    })
      .populate("contractorId clientId")
      .skip((page - 1) * limit)
      .limit(limit);

    if (getInvoice.length < 1) {
      return res
        .status(404)
        .json({ status: true, message: " No Invoice for approval " });
    }

    return res.status(202).json({
      status: true,
      message: "successfully fetched approved invoices",
      ApprovedInvoice: getInvoice,
      totalPage: totalPage,
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getPendingInvoice = async (req, res) => {
  try {
    const { contractorId } = req.query;
    const page = req.query.page || 1;
    const limit = 9;

    if (!contractorId) {
      return res.status(422).json({
        status: false,
        message: "Please provide all the required field properly",
      });
    }
    const totalContractor = await InvoiceApprovalModel.find({
      contractorId: contractorId,
      isPending: true,
      isApproved: false,
      isReject: false,
    }).countDocuments();
    const totalPage = Math.ceil(totalContractor / limit);

    const getInvoice = await InvoiceApprovalModel.find({
      contractorId: contractorId,
      isPending: true,
      isApproved: false,
      isReject: false,
    })
      .populate("contractorId clientId")
      .skip((page - 1) * limit)
      .limit(limit);

    if (getInvoice.length < 1) {
      return res
        .status(404)
        .json({ status: true, message: " No Invoice for pending " });
    }

    return res.status(202).json({
      status: true,
      message: "successfully fetched pending invoices",
      ApprovedInvoice: getInvoice,
      totalPage: totalPage,
      currentPage: page,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const approveInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    if (!invoiceId) {
      return res.status(422).json({
        status: false,
        message: "Please provide all the required field properly",
      });
    }

    const updateInvoice = await InvoiceApprovalModel.updateOne(
      { _id: invoiceId },
      { $set: { isApproved: true, isPending: false, isReject: false } }
    );

    const getInvoice = await InvoiceApprovalModel.findOne({ _id: invoiceId });

    if (updateInvoice.acknowledged) {
      const notifications = new NotificationModel({
        Message: `Invoice has been successfully approved`,
        Profile: [{ type: "Contractor", ref: getInvoice.contractorId }],
        NotificationFor: "Contractor"
      });

      const createdNotifications = await notifications.save();

      eventEmitter.emit("contractorinvoiceapprove", createdNotifications);
      return res
        .status(201)
        .json({ status: true, message: "Invoice successfully approved" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getSingleApprovedInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.query;

    if (!invoiceId) {
      return res.status(422).json({
        status: false,
        message: "Please Provide invoice id to view invoice",
      });
    }

    const savedInvoice = await InvoiceApprovalModel.findOne({
      _id: invoiceId,
    }).populate("contractorId clientId");

    if (!savedInvoice) {
      return res.status(404).json({
        status: false,
        message: "No Invoice is present with given id",
      });
    }

    return res.status(202).json({
      status: true,
      message: "successfully fetched single invoice",
      singleInvoice: savedInvoice,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};
