import mongoose from "mongoose";

const InvoiceModelSchema = new mongoose.Schema({
  ContractorId: {
    type: String,
    required: true,
  },
  InvoiceMonth: {
    type: String,
    required: true,
  },
  InvoiceYear: {
    type: String,
    required: true,
  },
  InvoiceScreenShot: {
    type: String,
    required: true,
  },
  IsApproved: {
    type: Boolean,
    default: true,
  },
  IsExpire: {
    type: Boolean,
    default: false,
  },
});

const InvoiceModel = mongoose.model("Invoices", InvoiceModelSchema);

export default InvoiceModel;
