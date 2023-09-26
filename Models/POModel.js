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
  IsApproved: {
    type: Boolean,
    required: true,
  },
});

const POModel = mongoose.model("PO", POSchema);

export default POModel;
