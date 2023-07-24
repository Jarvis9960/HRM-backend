import mongoose from "mongoose";

const contractorSchema = new mongoose.Schema({
    ActualName: {
        type: String,
        required: true,
      },
      ActualAadharNo: {
        type: String,
        required: true,
      },
      ActualPanNo: {
        type: String,
        required: true,
      },
       ActualPanImage: {
        type: String,
      },
      ActualAdharImage: {
        type: String,
      },
      BeneficiaryName: {
        type: String,
        required: true,
      },
      BeneficiaryAadharNo: {
        type: String,
        required: true,
      },
      BeneficiaryPanNo: {
        type: String,
        required: true,
      },
      BeneficiaryPanImage: {
        type: String,
      },
      BeneficiaryAadharImage: {
        type: String,
      },
      BankName: {
        type: String,
        required: true,
      },
      BankAccNo: {
        type: String,
        required: true,
      },
      IFSCcode: {
        type: String,
        required: true,
      },
    ContractName: {
      type: String,
      required: true,
    },
    Birthday: {
      type: String,
      required: true,
    },
    Address: {
      type: String,
      required: true,
    },
    Gender: {
      type: String,
      required: true,
    },
    ReportTo: {
      type: String,
      required: true,
    },
   JoinDate: {
      type: Date,
      required: true,
   },
    Nationality: {
      type: String,
      required: true,
    },
    Religion: {
      type: String,
    },
    EmergencyContactName: {
      type: String,
      required: true,
    },
    EmergencyContactRelation: {
      type: String,
      required: true,
    },
    EmergencyContactNumber: {
      type: Number,
      required: true,
    },
    IsApproved: {
        type: Boolean,
        default: false,
    }
  });

 const ContractorProfileModel = mongoose.model("ContractorProfile", contractorSchema);

 export default ContractorProfileModel