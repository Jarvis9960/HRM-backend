import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import randomString from "randomstring";
const nameregex = /^[a-zA-Z_ ]{1,30}$/;
const emailValidation = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passwordValidation =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{9,}$/;
import AdminModel from "../Models/AdminModel.js";
import ContractorProfileModel from "../Models/ContractorProfileModel.js";

//Create Admin
export const createAdmin = async (req, res) => {
  try {
    const data = req.body;
    let {
      first_name,
      last_name,
      email,
      repeat_email,
      password,
      repeat_password,
    } = req.body;
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
    if (repeat_email !== email) {
      return res.status(400).json({
        status: false,
        message: "Email and Repeat Email should match",
      });
    }
    let duplicateemail = await AdminModel.findOne({ email: email });
    if (duplicateemail) {
      return res
        .status(400)
        .json({ status: false, message: "email already existed" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide password" });
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
    if (repeat_password !== password) {
      return res.status(400).json({
        status: false,
        message: "Password and Repeat Password should match",
      });
    }
    // encrypt the password and set into the db
    data.password = await bcrypt.hash(password, 10);
    let adminData = await AdminModel.create(data);

    return res.status(201).json({ status: true, data: adminData });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

//Login Admin
export const loginAdmin = async function (req, res) {
  try {
    const data = req.body;
    const { email, password } = data;
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

    const user = await AdminModel.findOne({ email: data.email });
    if (!user) {
      return res.status(422).json({
        status: false,
        message: "Incorrect password or email",
      });
    }

    // password compare or not
    const compare = await bcrypt.compare(data.password, user.password);
    if (!compare) {
      return res.status(422).json({
        status: false,
        message: "Incorrect password or email",
      });
    }

    const expireTokenDate = new Date();
    expireTokenDate.setDate(expireTokenDate.getDate() + 1);

    const payload = {
      _id: user._id,
      role: "Admin",
    };
    const token = await jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 86400,
    });

    res.cookie("jwtToken", token, {
      httpOnly: true,
      expires: expireTokenDate,
      role: "Admin",
    });

    return res.status(201).json({
      status: true,
      message: "Login successfully",
      Token: {
        usertoken: token,
        expiry: expireTokenDate,
      },
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;

    if (!email) {
      res.status(422).json({ message: "please provide email" });
    }

    const existingUser = await AdminModel.findOne({ email: email });

    if (!existingUser) {
      res
        .status(422)
        .json({ message: "user doesn't exist please register first" });
    } else {
      const randomStringToken = randomString.generate().trim();

      const response = await AdminModel.updateOne(
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
        from: "exactsshubham@gmail.com", // sender address
        to: email, // list of receivers
        subject: "Reset-Password", // Subject line
        // text: "Here is the link to reset you password", // plain text body
        html: `<p>Hello, You  requested to change your password in HRM. Here is the link for resetting your password</P>.  <a href='http://localhost:5173/resetpassword/${randomStringToken}'>Reset your password</a>`, // html body
      });

      if (info.accepted[0] === email && response.acknowledged === true) {
        return res.status(200).json({
          status: true,
          Messgae: "email successfully sent to gmail",
          resetToken: randomStringToken,
        });
      } else {
        console.log(response);
        throw new Error("something went wrong");
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(442).json({
      status: false,
      Message: "something went wrong we couldn't process the reset link",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const resetPassToken = req.params.resetPassToken;
    const password = req.body.password;
    const cpassword = req.body.cpassword;

    if (!resetPassToken) {
      return res.status(422).json({
        status: false,
        Message:
          "Token is not provided generate new link for resetting password",
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
        Message: "Please provide password and confirm password field",
      });
    }

    const UserWhoWantPassChange = await AdminModel.findOne({
      forgotPassToken: resetPassToken,
    });

    if (!UserWhoWantPassChange) {
      return res.status(422).json({
        Status: false,
        Message: "Token is expired Please generate your reset link again",
      });
    } else {
      if (password !== cpassword) {
        return res.status(422).json({
          Status: false,
          Message:
            "password and confirm password are not matching please check it again",
        });
      }

      const verifyPassword = bcrypt.compareSync(
        password,
        UserWhoWantPassChange.password
      );

      if (verifyPassword) {
        return res.status(422).json({
          status: false,
          Message: "password is same as your old password",
        });
      }

      let plainTextPassword = password;

      const salt = await bcrypt.genSaltSync(10);

      const securePassword = await bcrypt.hashSync(plainTextPassword, salt);

      const changesPassword = await AdminModel.updateOne(
        { forgotPassToken: resetPassToken },
        { $set: { password: securePassword, forgotPassToken: "" } }
      );

      if (changesPassword.acknowledged === true) {
        return res
          .status(200)
          .json({ status: true, message: "Password changes successfully" });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(422).json({
      status: false,
      Message: "something went wrong please reset your password again",
    });
  }
};

export const addOrganizationToContratorProfile = async (req, res) => {
  try {
    const { organization, profileId } = req.body;

    if (!organization) {
      return res.status(422).json({
        status: false,
        message: "Please filled all the required field properly",
      });
    }

    const updatecontractorprofile = await ContractorProfileModel.updateOne(
      { _id: profileId },
      { $push: { Organization: organization } }
    );

    if (updatecontractorprofile.acknowledged) {
      return res
        .status(201)
        .json({
          status: true,
          message: "successfully added organization to contrator",
        });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};
