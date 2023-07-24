import ContractorModel from "../Models/ContractorModel.js";
import ContractorProfileModel from "../Models/ContractorProfileModel.js";
import { generateRandomPassword } from "../Utils/PasswordUtil.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
const nameregex = /^[a-zA-Z_ ]{1,30}$/;
const emailValidation = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

// Create Contractor
export const createContractor = async (req, res) => {
  try {
    const data = req.body;
    const { first_name, last_name, email } = req.body;

    if (!Object.keys(req.body).length > 0) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide details" });
    }
    if (!first_name) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide first_name" });
    }
    if (typeof first_name !== "string" || first_name.trim().length === 0) {
      return res
        .status(400)
        .json({ status: false, msg: "Enter valid first_name" });
    }
    if (!first_name.match(nameregex)) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide valid first_name" });
    }
    if (!last_name) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide last_name" });
    }
    if (typeof last_name !== "string" || last_name.trim().length === 0) {
      return res
        .status(400)
        .json({ status: false, msg: "Enter valid last_name" });
    }
    if (!last_name.match(nameregex)) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide valid last_name" });
    }
    if (!email) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide email" });
    }
    if (typeof email !== "string" || email.trim().length === 0) {
      return res.status(400).json({ status: false, msg: "Enter valid email" });
    }
    if (!email.match(emailValidation)) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide valid email" });
    }

    const existingContractor = await ContractorModel.findOne({ email });
    if (existingContractor) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const password = generateRandomPassword();
    const savedContractor = await ContractorModel.create(data);
    savedContractor.password = password;
    await savedContractor.save();

    //Send the email to the contractor
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: "exactsshubham@gmail.com",
      to: email,
      subject: "Welcome to our platform",
      text: `Dear${first_name},\n\nYou have successfully added as a contractor. Here are your login credentials:\n\nEmail: ${email}\nPassword: ${password}\n\nPlease use these credentials to log in our platform.\n\nBest regards,\nThe Admin Team`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
      } else {
        console.log("Email sent", info.response);
      }
    });
    return res.status(201).json({ status: true, data: savedContractor });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

//Login Contractor
export const loginContractor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!Object.keys(req.body).length > 0) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide details" });
    }

    if (!email) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide email" });
    }

    if (!password) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide password" });
    }

    const contractor = await ContractorModel.findOne({ email });

    if (!contractor) {
      return res.status(404).json({
        status: false,
        message: "Invalid email or password.",
      });
    }

    if (contractor.password !== password) {
      return res.status(401).json({
        status: false,
        message: "Invaild email or password.",
      });
    }

    const expireTokenDate = new Date();
    expireTokenDate.setDate(expireTokenDate.getDate() + 1);

    const payload = {
      _id: contractor._id,
      role: "Contractor",
    };
    const token = await jwt.sign(payload, process.env.JWT_SECRET2, {
      expiresIn: 86400,
    });

    res.cookie("jwtToken", token, {
      httpOnly: true,
      expires: expireTokenDate,
      role: "Contractor",
    });

    return res.status(201).json({
      status: true,
      message: "Login successfully",
      Token: {
        usertoken: token,
        expiry: expireTokenDate,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

//Update contractor's profile

export const updatecontractorprofile = async (req, res) => {
  try {
    let {
      actualName,
      actualAadharNo,
      actualPanNo,
      beneficiaryName,
      beneficiaryAadharNo,
      beneficiaryPanNo,
      bankName,
      bankAccNo,
      ifscCode,
      contractName,
      joinDate,
      birthday,
      address,
      gender,
      reportTo,
      nationality,
      religion,
      emergencyContactName,
      emergencyContactRelation,
      emergencyContactNumber,
    } = req.body;
    let files = req.files;

    if (
      !actualName ||
      !actualAadharNo ||
      !actualPanNo ||
      !beneficiaryName ||
      !beneficiaryAadharNo ||
      !beneficiaryPanNo ||
      !contractName ||
      !joinDate ||
      !birthday ||
      !address ||
      !gender ||
      !reportTo ||
      !nationality ||
      !emergencyContactName ||
      !emergencyContactRelation ||
      !emergencyContactNumber ||
      !bankName ||
      !bankAccNo ||
      !ifscCode
    ) {
      return res.status(400).json({
        status: "false",
        message: "Please fill all the required fields",
      });
    } else if (
      !beneficiaryName.match(nameregex) ||
      !actualName.match(nameregex)
    ) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide valid name" });
    }

    const sameActualPanNo = await ContractorProfileModel.findOne({
      ActualPanNo: actualPanNo,
    });
    const sameActualAadhar = await ContractorProfileModel.findOne({
      ActualAadharNo: actualAadharNo,
    });

    if (sameActualPanNo || sameActualAadhar) {
      res
        .status(400)
        .json({ status: false, message: "Actual id already exist" });
    }

    const sameBeneficiaryAadhar = await ContractorProfileModel.findOne({
      BeneficiaryAadharNo: beneficiaryAadharNo,
    });
    const sameBeneficiaryPan = await ContractorProfileModel.findOne({
      BeneficiaryPanNo: beneficiaryPanNo,
    });

    if (sameBeneficiaryAadhar || sameBeneficiaryPan) {
      res
        .status(400)
        .json({ status: false, message: "Beneficiary id already exist" });
    }
    console.log(files);

    const actualPanLink = files.actualPanImage[0].path;
    const actualAadharLink = files.actualAdharImage[0].path;
    const beneficiaryPanLink = files.beneficiaryPanImage[0].path;
    const beneficiaryAadharLink = files.beneficiaryAadharImage[0].path;

    if (
      !actualPanLink ||
      !actualAadharLink ||
      !beneficiaryPanLink ||
      !beneficiaryAadharLink
    ) {
      return res.status(400).json({
        status: false,
        message:
          "Please upload all required files (actualPanImage, actualAdharImage, beneficiaryPanImage, beneficiaryAadharImage)",
      });
    }

    const birthdayDateObject = new Date(birthday);
    const joiningDateObject = new Date(joinDate);

    const updatecontractorprofile = await ContractorProfileModel.create({
      ActualName: actualName,
      ActualAadharNo: actualAadharNo,
      ActualPanNo: actualPanNo,
      ActualPanImageLink: actualPanLink,
      ActualAdharImageLink: actualAadharLink,
      BeneficiaryName: beneficiaryName,
      BeneficiaryAadharNo: beneficiaryAadharNo,
      BeneficiaryPanNo: beneficiaryPanNo,
      BeneficiaryPanImageLink: beneficiaryPanLink,
      BeneficiaryAadharImageLink: beneficiaryAadharLink,
      BankName: bankName,
      BankAccNo: bankAccNo,
      IFSCcode: ifscCode,
      ContractName: contractName,
      JoinDate: joiningDateObject,
      Birthday: birthdayDateObject,
      Address: address,
      Gender: gender,
      ReportTo: reportTo,
      Nationality: nationality,
      Religion: religion,
      EmergencyContactName: emergencyContactName,
      EmergencyContactRelation: emergencyContactRelation,
      EmergencyContactNumber: emergencyContactNumber,
    });

    const profileId = await ContractorModel.findByIdAndUpdate(
      { _id: req.user._id },
      { profileId: updatecontractorprofile._id }
    );

    console.log(profileId);

    // Send email notification to admin
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: "exactsshubham@gmail.com",
      to: "ankitfukte11@gmail.com",
      subject: "Contractor Profile Updated",
      text: `The profile for contractor ${updatecontractorprofile.ActualName} with aadharNumber ${updatecontractorprofile.ActualAadharNo} has been updated.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
      } else {
        console.log("Email sent", info.response);
      }
    });
    res.status(201).json({ status: true, message: "Successfully Updated" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

//Get Contractors
export const getContractor = async function (req, res) {
  try {
    const page = req.query.page || 1;
    const limit = 2;

    const totalContractors = await ContractorModel.count();
    const totalPages = Math.ceil(totalContractors / limit);

    const contractors = await ContractorModel.find()
      .populate("profileId")
      .skip((page - 1) * limit)
      .limit(limit);

    if (!contractors.length > 0) {
      return res
        .status(404)
        .json({ status: false, message: "Contractors not found" });
    }
    return res.status(200).json({
      status: true,
      data: contractors,
      page: page,
      totalPages: totalPages,
      totalContractors: totalContractors,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Approve Contractor
export const approveContractor = async (req, res) => {
  try {
    let { contractorId } = req.body;

    if (!contractorId) {
      return res
        .status(422)
        .json({ status: false, message: "Please provide valid details" });
    }

    const contractorExist = await ContractorModel.findOne({
      _id: contractorId,
    });
    if (!contractorExist) {
      return res
        .status(404)
        .json({ status: false, message: "Contractor not found" });
    }

    const approvedContactor = await ContractorProfileModel.updateOne(
      { _id: contractorExist.profileId },
      { $set: { IsApproved: true } }
    );

    if (approvedContactor.acknowledged) {
      return res
        .status(201)
        .json({ status: true, message: "Successfully approved contractor" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong" });
  }
};

//Get Contractor Data with its Profile

export const getdetailsofContractor = async function (req, res) {
  try {
    let { contractorId } = req.query;
    if (!contractorId) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide contractorId" });
    }

    let contractor = await ContractorModel.findOne({ _id: contractorId }).populate("profileId");
    if (!contractor) {
      return res
        .status(404)
        .send({ status: false, message: "This contractor does not exist" });
    }

    // let contractorProfileData = await ContractorProfileModel.find({ _id: contractor.profileId })

    // if (contractorProfileData.length == 0) {
    //   var x = "This contractor profile does not exist";
    // } else {
    //   var x = contractorProfileData;
    // }

    // contractor._doc.contractorProfileData = x
    return res.status(200).send({ status: true, data: contractor });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};
