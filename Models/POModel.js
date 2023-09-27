import mongoose from "mongoose";

const POSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
  },
  PONumber: {
    type: Number,
    required: true,
  },
  POAmount: {
    type: Number,
    required: true,
  },
  ValidFrom: {
    type: Date,
    required: true,
  },
  ValidTill: {
    type: Date,
    required: true,
  },
  PODiscription: {
    type: String,
    required: true,
  },
  IssuerName: {
    type: String,
    required: true,
  },
  IssuerEmail: {
    type: String,
    required: true,
  },
  IsActive: {
    type: Boolean,
    default: true,
  },
  IsExpired: {
    type: Boolean,
    default: false,
  },
  Contractors: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contractor" }],
  },
});

const POModel = mongoose.model("PO", POSchema);

export default POModel;
