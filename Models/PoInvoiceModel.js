import mongoose from "mongoose";

const poInvoiceSchema = new mongoose.Schema({
  Poid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PO",
  },
  ContractorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contractor",
  },
  Name: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
  GSTInUIn: {
    type: Number,
    required: true,
  },
  InvoiceNumber: {
    type: String,
    required: true,
  },
  Amount: {
    type: Number,
    required: true,
  },
});

const poInvoiceModel = mongoose.model("poInvoice", poInvoiceSchema);

export default poInvoiceModel;
