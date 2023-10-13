import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
  OwnOrganization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ourOrgnaization"
  },
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
