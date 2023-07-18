import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    personalInformation: {
      phoneNumber: {
        type: String,
        required: true,
        unique: true,
      },
      birthday: {
        type: Date,
        required: false,
      },
      address: {
        type: String,
        required: false,
      },
      gender: {
        type: String,
        enum: ["Male", "Female", "LGBTQ"],
        required: false,
      },
    },
    passportInformation: {
      passportNo: {
        type: String,
        required: false,
      },
      passportExpDate: {
        type: Date,
        required: false,
      },
    },
    contactInformation: {
      telephone: {
        type: String,
        required: false,
      },
    },
    additionalDetails: {
      religion: {
        type: String,
        required: false,
      },
      maritalStatus: {
        type: String,
        required: false,
      },
      employmentOfSpouse: {
        type: String,
        required: false,
      },
      numberOfChildren: {
        type: Number,
        required: false,
      },
    },
    primaryContact: {
      name: {
        type: String,
        required: false,
      },
      relationship: {
        type: String,
        required: false,
      },
      phoneNumber: {
        type: String,
        required: false,   
      },
    },
    secondaryContact: {
      name: {
        type: String,
        required: false,
      },
      relationship: {
        type: String,
        required: false,
      },
      phoneNumber: {
        type: String,
        required: false,
      },
    },
  },
  { timestamps: true }
);

 const ProfileModel = mongoose.model("Profile", profileSchema);
 export default ProfileModel
