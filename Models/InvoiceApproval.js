import mongoose from "mongoose";

const invoiceApprovalSchema = new mongoose.Schema({
  contractorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contractor",
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client"
  },
  amount: {
    type: Number,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  isPending: {
    type: Boolean,
    default: true,
  },
  isReject: {
    type: Boolean,
    default: false,
  },
  InvoiceMonth: {
    type: Date,
    required: true,
  },
  ApprovalScreenshot: {
    type: String,
    required: true,
  },
});

const InvoiceApprovalModel = mongoose.model(
  "InvoiceModel",
  invoiceApprovalSchema
);

export default InvoiceApprovalModel;
