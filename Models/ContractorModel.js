import mongoose from "mongoose";


const contractorSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      default: null,
    },
  },
  { timestamps: true }
);

const ContractorModel = mongoose.model("Contractor", contractorSchema);
export default ContractorModel;