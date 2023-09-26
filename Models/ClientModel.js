import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
  },
  clientEmail: {
    type: String,
    required: true,
  },
  PO: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PO",
    },
  ],
});

const ClientModel = mongoose.model("Client", ClientSchema);

export default ClientModel;
