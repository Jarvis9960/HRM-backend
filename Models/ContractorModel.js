import mongoose from "mongoose";
import { generateRandomPassword } from "../Utils/PasswordUtil.js";

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
      ref: "ContractorProfile",
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate random password before saving the contractor
contractorSchema.pre("save", function (next) {
  if (this.isNew || !this.password) {
    this.password = generateRandomPassword();
  }
  next();
});

const ContractorModel = mongoose.model("Contractor", contractorSchema);
export default ContractorModel;