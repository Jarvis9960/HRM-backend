import AdminModel from "../Models/AdminModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const nameregex = /^[a-zA-Z_ ]{1,30}$/;
const emailValidation = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passwordValidation = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

export const createAdmin = async (req, res) => {
  try {
    const data = req.body;
    let { first_name, last_name, email, repeat_password, password, repeat_email } = req.body;
    if (!Object.keys(req.body).length > 0) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide Details" });
    };
    if (!first_name) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide first_name" });
    };
    if (typeof first_name !== "string" || first_name.trim().length === 0) {
      return res
        .status(400)
        .json({ status: false, msg: "Enter valid first_name" });
    };
    if (!first_name.match(nameregex)) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide valid first_name" });
    };
    if (!last_name) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide last_name" });
    };
    if (typeof last_name !== "string" || last_name.trim().length === 0) {
      return res
        .status(400)
        .json({ status: false, msg: "Enter valid last_name" });
    };
    if (!last_name.match(nameregex)) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide valid last_name" });
    };
    if (!email) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide email" });
    };
    if (typeof email !== "string" || email.trim().length === 0) {
      return res.status(400).json({ status: false, msg: "Enter valid email" });
    };
    if (!email.match(emailValidation)) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide valid email" });
    };
    if (repeat_email !== email) {
        return res
          .status(400)
          .json({ status: false, message: "Email and Repeat Email should match" });
      };  
    let duplicateemail = await AdminModel.findOne({ email: email });
    if (duplicateemail) {
      return res
        .status(400)
        .json({ status: false, message: "email already existed" });
    };
    if (!password) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide password" });
    };
    if (typeof password !== "string" || password.trim().length === 0) {
      return res
        .status(400)
        .json({ status: false, msg: "Enter valid password" });
    };
    if (!password.match(passwordValidation)) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide valid password" });
    };
    if (repeat_password !== password) {
        return res
          .status(400)
          .json({ status: false, message: "Password and Repeat Password should match" });
      };
    // encrypt the password and set into the db
    data.password = await bcrypt.hash(password, 10);
    let adminData = await AdminModel.create(data);

    return res.status(201).json({ status: true, data: adminData });
  
} catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};





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
    if (typeof email !== "string" || email.trim().length === 0) {
      return res.status(400).json({ status: false, msg: "Enter valid email" });
    }
    if (!email.match(emailValidation)) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide valid email" });
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

    const user = await AdminModel.findOne({ email: data.email });
    if (!user) {
      return res.status(422).json({
        status: false,
        message: "Email not exist",
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

    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: 86400,
    });

    return res.status(201).json({
      status: true,
      message: "Login successfully",
      role:user.role,
      Token: {
        usertoken: token,
        expiry: expireTokenDate,
      },
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

