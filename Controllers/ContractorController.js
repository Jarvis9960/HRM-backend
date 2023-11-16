import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import randomString from "randomstring";
const nameregex = /^[a-zA-Z_ ]{1,30}$/;
const emailValidation = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passwordValidation =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{9,}$/;
import ContractorModel from "../Models/ContractorModel.js";
import ContractorProfileModel from "../Models/ContractorProfileModel.js";
import { generateRandomPassword } from "../Utils/PasswordUtil.js";
import eventEmitter from "../Utils/eventEmitter.js";
import { bucket, bucketName } from "../Utils/googleStorage.js";
import AdminModel from "../Models/AdminModel.js";
import NotificationModel from "../Models/Notification.js";

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
    const plainTextPassword = generateRandomPassword();
    const salt = await bcrypt.genSaltSync(10);
    const securePassword = await bcrypt.hashSync(plainTextPassword, salt);
    const savedContractor = await ContractorModel.create(data);
    savedContractor.password = securePassword;
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
      text: `Dear ${first_name},\n\nYou have been successfully added as a contractor. Here are your login credentials:\n\nEmail: ${email}\nPassword: ${plainTextPassword}\n\nPlease use these credentials to log in to our platform.\n\nBest regards,\nThe Admin Team`,
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
    const data = req.body;
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

    // password compare or not
    const compare = await bcrypt.compare(data.password, contractor.password);
    if (!compare) {
      return res.status(422).json({
        status: false,
        message: "Incorrect password or email",
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

    if (sameActualPanNo) {
      return res.status(400).json({
        status: false,
        message: "ActualPanNo already exist",
      });
    }

    if (sameActualAadhar) {
      return res.status(400).json({
        status: false,
        message: "ActualAadharNo already exist",
      });
    }

    const sameBeneficiaryAadhar = await ContractorProfileModel.findOne({
      BeneficiaryAadharNo: beneficiaryAadharNo,
    });
    const sameBeneficiaryPan = await ContractorProfileModel.findOne({
      BeneficiaryPanNo: beneficiaryPanNo,
    });

    if (sameBeneficiaryAadhar) {
      return res
        .status(400)
        .json({ status: false, message: "BeneficaiaryAadharNo already exist" });
    }

    if (sameBeneficiaryPan) {
      return res
        .status(400)
        .json({ status: false, message: "BeneficaiaryPanNo already exist" });
    }

    const actualPanLink = files.actualPanImage[0];
    const actualAadharLink = files.actualAdharImage[0];
    const beneficiaryPanLink = files.beneficiaryPanImage[0];
    const beneficiaryAadharLink = files.beneficiaryAadharImage[0];

    const documents = [
      actualPanLink,
      actualAadharLink,
      beneficiaryPanLink,
      beneficiaryAadharLink,
    ];

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

    let uploaded = [];

    // Promises for tracking the completion of file uploads
    const uploadPromises = [];

    for (let i = 0; i < documents.length; i++) {
      const blob = bucket.file(documents[i].originalname);
      const blobStream = blob.createWriteStream({
        resumable: false,
      });

      blobStream.on("error", (err) => {
        console.log("Error uploading file: " + err);
        // Handle the error here
      });

      // Create a promise for each file upload
      const uploadPromise = new Promise((resolve, reject) => {
        blobStream.on("finish", async () => {
          console.log(`${i} file uploaded`);
          const imageInfo = await bucket.file(documents[i].originalname);

          imageInfo
            .get()
            .then((resp) => {
              const url = `${resp[0].storage.apiEndpoint}/${resp[0].bucket.id}/${resp[0].id}`;
              uploaded.push(url);
              resolve(url);
            })
            .catch((err) => {
              // Handle the error here
              reject(err);
            });
        });

        blobStream.end(documents[i].buffer);
      });

      uploadPromises.push(uploadPromise);
    }

    // Wait for all file uploads to complete
    Promise.all(uploadPromises)
      .then(async () => {
        const birthdayDateObject = new Date(birthday);
        const joiningDateObject = new Date(joinDate);

        const updatecontractorprofile = await ContractorProfileModel.create({
          ActualName: actualName,
          ActualAadharNo: actualAadharNo,
          ActualPanNo: actualPanNo,
          ActualPanImage: uploaded[0],
          ActualAdharImage: uploaded[1],
          BeneficiaryName: beneficiaryName,
          BeneficiaryAadharNo: beneficiaryAadharNo,
          BeneficiaryPanNo: beneficiaryPanNo,
          BeneficiaryPanImage: uploaded[2],
          BeneficiaryAadharImage: uploaded[3],
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

        if (profileId) {
          const getAllAdmin = await AdminModel.find();

          const message = `${profileId.first_name} ${profileId.last_name} has successfully updated profile`;

          const notifications = getAllAdmin.map((admin) => ({
            Message: message,
            Profile: [
              { type: "Admin", ref: admin._id },
              { type: "Contractor", ref: profileId },
            ],
          }));

          // Create an array of notifications for all admin users
          const createdNotifications = await NotificationModel.create(
            notifications
          );

          eventEmitter.emit("contractorupdate", createdNotifications);
        }

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
      })
      .catch((err) => {
        console.error("Error uploading files:", err);
        // Handle the error here
        throw new Error(err);
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, message: err.message });
  }
};

//Get Contractors
export const getContractor = async function (req, res) {
  try {
    const page = req.query.page || 1;
    const limit = 9;

    const totalContractors = await ContractorModel.count();
    const totalPages = Math.ceil(totalContractors / limit);

    const contractors = await ContractorModel.find()
      .populate("profileId", "-password")
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

//Search Query in Contractors
export const searchContractors = async (req, res) => {
  try {
    const { searchQuery, page = 1, limit = 9 } = req.query;

    if (!searchQuery) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide a search query" });
    }

    const searchPattern = new RegExp(searchQuery, "i");

    const totalCount = await ContractorModel.countDocuments({
      $or: [
        { first_name: { $regex: searchPattern } },
        { last_name: { $regex: searchPattern } },
        { email: { $regex: searchPattern } },
      ],
    });

    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    const contractors = await ContractorModel.find({
      $or: [
        { first_name: { $regex: searchPattern } },
        { last_name: { $regex: searchPattern } },
        { email: { $regex: searchPattern } },
      ],
    })
      .skip(skip)
      .limit(limit);

    if (contractors.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No contractors found for the given search query",
      });
    }

    return res.status(200).json({
      status: true,
      data: contractors,
      pageInfo: {
        totalResults: totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
// Approve Contractor Profile
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
      { $set: { IsApproved: true, IsDecline: false } }
    );

    if (approvedContactor.acknowledged) {
      const notifications = new NotificationModel({
        Message: `Invoice has been successfully approved`,
        Profile: [{ type: "Contractor", ref: contractorId }],
      });

      const createdNotifications = await notifications.save();

      eventEmitter.emit("contractorprofileapprove", createdNotifications);
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

//Decline Contractor Profile
export const declineContractor = async (req, res) => {
  try {
    let { contractorId, feedback } = req.body;

    if (!contractorId || !feedback) {
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

    const approvedContractor = await ContractorProfileModel.updateOne(
      { _id: contractorExist.profileId },
      { $set: { IsDecline: true, IsApproved: false } }
    );

    if (approvedContractor.acknowledged) {
      const notifications = new NotificationModel({
        Message: `Invoice has been successfully approved`,
        Profile: [{ type: "Contractor", ref: contractorId }],
      });

      const createdNotifications = await notifications.save();

      eventEmitter.emit("contractorprofiledecline", createdNotifications);
      // Send email to the contractor
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
        to: contractorExist.email,
        subject: "Contractor Updated Application Declined",
        text: `Dear Contractor,\n\nWe regret to inform you that your updated profile has been declined.\n\nFeedback: ${feedback}\n\nThank you.\n\nSincerely, Admin`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });

      return res
        .status(201)
        .json({ status: true, message: "Successfully decline contractor" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong" });
  }
};

//Get Contractor Data with its Profile for Admin
export const getdetailsofContractor = async function (req, res) {
  try {
    let { contractorId } = req.query;
    if (!contractorId) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide contractorId" });
    }

    let contractor = await ContractorModel.findOne({
      _id: contractorId,
    }).populate({
      path: "profileId",
      select: "-password",
      populate: [
        {
          path: "Organization",
        },
        {
          path: "SelfOrganization.id",
        },
      ],
    });

    if (!contractor) {
      return res.status(404).send({
        status: false,
        message: "This contractor does not exist",
      });
    }

    return res.status(200).send({ status: true, data: contractor });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//Get Contractor Data with its Profile for particular Contractor
export const getowndetailsofContractor = async function (req, res) {
  try {
    let contractorId = req.user._id;

    let contractor = await ContractorModel.findOne({
      _id: contractorId,
    }).populate({
      path: "profileId",
      select: "-password",
      populate: {
        path: "SelfOrganization",
        populate: {
          path: "id",
        },
      },
    });
    if (!contractor) {
      return res
        .status(404)
        .send({ status: false, message: "This contractor does not exist" });
    }

    return res.status(200).send({ status: true, data: contractor });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

export const contractorForgotPassword = async (req, res) => {
  try {
    const email = req.body.email;

    if (!email) {
      return res.status(422).json({ message: "Please provide an email" });
    }

    const existingContractor = await ContractorModel.findOne({ email: email });

    if (!existingContractor) {
      return res
        .status(422)
        .json({ message: "Contractor doesn't exist. Please register first" });
    }

    const randomStringToken = randomString.generate().trim();

    const response = await ContractorModel.updateOne(
      { email: email },
      { $set: { forgotPassToken: randomStringToken } },
      { new: true }
    );

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    let info = await transporter.sendMail({
      from: "exactsshubham@gmail.com",
      to: email,
      subject: "Reset Password",
      html: `<p>Hello, You requested to change your password. Here is the link for resetting your password. <a href='http://localhost:4000/resetpassword/${randomStringToken}'>Reset your password</a></p>`,
    });

    if (info.accepted[0] === email && response.acknowledged === true) {
      return res.status(200).json({
        status: true,
        message: "Email successfully sent for password reset",
        resetToken: randomStringToken,
      });
    } else {
      throw new Error("Something went wrong");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong. We couldn't process the reset link.",
    });
  }
};

export const contractorResetPassword = async (req, res) => {
  try {
    const resetPassToken = req.params.resetPassToken;
    const password = req.body.password;
    const cpassword = req.body.cpassword;

    if (!resetPassToken) {
      return res.status(422).json({
        status: false,
        message:
          "Token is not provided. Generate a new link for resetting the password",
      });
    }

    if (typeof password !== "string" || password.trim().length === 0) {
      return res
        .status(400)
        .json({ status: false, msg: "Enter valid password" });
    }

    if (!password.match(passwordValidation)) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide valid password" });
    }

    if (!password || !cpassword) {
      return res.status(422).json({
        status: false,
        message: "Please provide a password and confirm password",
      });
    }

    const contractorToReset = await ContractorModel.findOne({
      forgotPassToken: resetPassToken,
    });

    if (!contractorToReset) {
      return res.status(422).json({
        status: false,
        message: "Token is expired. Please generate a new reset link.",
      });
    } else {
      if (password !== cpassword) {
        return res.status(422).json({
          status: false,
          message:
            "Password and confirm password do not match. Please check again.",
        });
      }

      const verifyPassword = bcrypt.compareSync(
        password,
        contractorToReset.password
      );

      if (verifyPassword) {
        return res.status(422).json({
          status: false,
          message: "The new password is the same as the old password.",
        });
      }
      let plainTextPassword = password;

      const salt = await bcrypt.genSaltSync(10);

      const securePassword = await bcrypt.hashSync(plainTextPassword, salt);

      const updatedContractor = await ContractorModel.updateOne(
        { forgotPassToken: resetPassToken },
        { $set: { password: securePassword, forgotPassToken: "" } }
      );

      if (updatedContractor.acknowledged === true) {
        return res.status(200).json({
          status: true,
          message: "Password changed successfully",
          newPassword: plainTextPassword,
        });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong. Please reset your password again.",
    });
  }
};

export const reupdateContractorProfile = async (req, res) => {
  try {
    const profileId = req.user.profileId;
    const updateData = req.body;
    const files = req.files;

    if (files) {
      if (files.actualPanImage) {
        updateData.ActualPanImageLink = files.actualPanImage[0].path;
      }
      if (files.actualAadharImage) {
        updateData.ActualAadharImageLink = files.actualAadharImage[0].path;
      }
      if (files.beneficiaryPanImage) {
        updateData.BeneficiaryPanImageLink = files.beneficiaryPanImage[0].path;
      }
      if (files.beneficiaryAadharImage) {
        updateData.BeneficiaryAadharImageLink =
          files.beneficiaryAadharImage[0].path;
      }
    }

    updateData.actualName = req.body.actualName;
    updateData.actualAadharNo = req.body.actualAadharNo;
    updateData.actualPanNo = req.body.actualPanNo;
    updateData.beneficiaryName = req.body.beneficiaryName;
    updateData.beneficiaryAadharNo = req.body.beneficiaryAadharNo;
    updateData.beneficiaryPanNo = req.body.beneficiaryPanNo;
    updateData.bankName = req.body.bankName;
    updateData.bankAccNo = req.body.bankAccNo;
    updateData.ifscCode = req.body.ifscCode;
    updateData.contractName = req.body.contractName;
    updateData.joinDate = req.body.joinDate;
    updateData.birthday = req.body.birthday;
    updateData.address = req.body.address;
    updateData.gender = req.body.gender;
    updateData.reportTo = req.body.reportTo;
    updateData.nationality = req.body.nationality;
    updateData.religion = req.body.religion;
    updateData.emergencyContactName = req.body.emergencyContactName;
    updateData.emergencyContactRelation = req.body.emergencyContactRelation;
    updateData.emergencyContactNumber = req.body.emergencyContactNumber;

    const sameActualPanNo = await ContractorProfileModel.findOne({
      ActualPanNo: updateData.actualPanNo,
    });

    const sameActualAadhar = await ContractorProfileModel.findOne({
      ActualAadharNo: updateData.actualAadharNo,
    });

    if (sameActualPanNo) {
      return res.status(400).json({
        status: false,
        message: "ActualPanNo already exists",
      });
    }

    if (sameActualAadhar) {
      return res.status(400).json({
        status: false,
        message: "ActualAadharNo already exist",
      });
    }

    const sameBeneficiaryAadhar = await ContractorProfileModel.findOne({
      BeneficiaryAadharNo: updateData.beneficiaryAadharNo,
    });
    const sameBeneficiaryPan = await ContractorProfileModel.findOne({
      BeneficiaryPanNo: updateData.beneficiaryPanNo,
    });

    if (sameBeneficiaryAadhar) {
      return res
        .status(400)
        .json({ status: false, message: "BeneficaiaryAadharNo already exist" });
    }

    if (sameBeneficiaryPan) {
      return res
        .status(400)
        .json({ status: false, message: "BeneficaiaryPanNo already exist" });
    }

    const updatedProfile = await ContractorProfileModel.findByIdAndUpdate(
      profileId,
      updateData,
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({
        status: false,
        message: "Contractor profile not updated",
      });
    }

    if (updatedProfile.acknowledged) {
      // Send email to the contractor
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
        to: "ankitfukte11@gmail.com",
        subject: "Contractor Reupdated Profile",
        text: `The profile for contractor ${updatedProfile.ActualName} with aadharNumber ${updatedProfile.ActualAadharNo} has been reupdated.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });
    }

    res.status(200).json({
      status: true,
      message: "Contractor profile successfully reupdated",
      updatedProfile,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

export const updateOrganizationInProfile = async (req, res) => {
  try {
    const { contractorId, clientId, amount, businessDays } = req.body;

    if (!contractorId || !clientId || !amount || !businessDays) {
      return res.status(422).json({
        status: false,
        message: "Please provide all the required field properly",
      });
    }

    const organizationExists = await ContractorProfileModel.findOne({
      _id: contractorId,
      "SelfOrganization.id": clientId,
    });

    if (organizationExists) {
      return res
        .status(202)
        .json({ status: false, message: "Organization already exists" });
    }

    const updateResponse = await ContractorProfileModel.updateOne(
      { _id: contractorId },
      {
        $push: {
          SelfOrganization: {
            id: clientId,
            amount: amount,
            businessDays: businessDays,
          },
        },
      }
    );

    if (updateResponse.acknowledged) {
      return res
        .status(201)
        .json({ status: true, message: "organization successfully added" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const deleteOrganizationFromContractor = async (req, res) => {
  try {
    const { contractorId, clientId } = req.query;

    if (!contractorId || !clientId) {
      return res.status(422).json({
        status: false,
        message: "Please provide all the required field properly",
      });
    }

    const deleteResponse = await ContractorProfileModel.updateOne(
      { _id: contractorId },
      { $pull: { SelfOrganization: { id: clientId } } }
    );

    if (deleteResponse.acknowledged) {
      return res
        .status(201)
        .json({ status: true, message: "organization had been removed" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};
