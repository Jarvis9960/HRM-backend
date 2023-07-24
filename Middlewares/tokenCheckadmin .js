import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve("../config.env") });
import AdminModel from "../Models/AdminModel.js";

export const tokenCheckadmin = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
     
      if (!token) {
        throw new Error("Token is not given");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const checkAdmin = await AdminModel.findOne({_id: decoded._id}).select("-password");

      req.user = checkAdmin;
     
      next();
    } catch (error) {
      console.log(error)
      return res.status(442).json({ message: "Invalid Auth" });
    }
  } else {
    return res.status(422).json({ message: "No token" });
  }
};