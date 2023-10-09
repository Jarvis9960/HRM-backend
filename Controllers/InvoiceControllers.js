import moment from "moment";
import InvoiceApprovalModel from "../Models/InvoiceApproval.js";

export const createInvoiceApproval = async (req, res) => {
  try {
    const { amount, month, year } = req.body;

    if (!amount || !month || !year) {
      return res.status(422).json({
        status: false,
        message: "Please provide all the required field",
      });
    }

    const approvalScreenshot = req.file;

    if (!approvalScreenshot) {
      return res.status(422).json({
        status: false,
        message: "Approval screenshot has not been submitted",
      });
    }

    const invoiceDate = moment(`${month} ${year}`, "MMMM YYYY")
      .add(1, "month")
      .toDate();

    const newInvoiceApproval = new InvoiceApprovalModel({
      contractorId: req.user._id,
      amount: amount,
      InvoiceMonth: invoiceDate,
      ApprovalScreenshot: approvalScreenshot.path,
    });

    const savedResponse = await newInvoiceApproval.save();

    if (savedResponse) {
      return res.status(202).json({
        status: true,
        message: "Successfully created invoice approval",
      });
    }
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
      .populate("contractorId")
      .skip((page - 1) * limit)
      .limit(limit);

    if (getInvoice.length < 1) {
      return res
        .status(202)
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
      .populate("contractorId")
      .skip((page - 1) * limit)
      .limit(limit);

    if (getInvoice.length < 1) {
      return res
        .status(202)
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

    if (updateInvoice.acknowledged) {
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
