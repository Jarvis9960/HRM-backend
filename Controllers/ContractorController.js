import ContractorModel from "../Models/ContractorModel.js";

const nameregex = /^[a-zA-Z_ ]{1,30}$/;
const emailValidation = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

// Create a new contractor
export const createContractor = async (req, res) => {
  try {
    const data = req.body
    const { first_name, last_name, email } = req.body;

    if(!Object.keys(req.body).length>0){
        return res.status(400).json({ status:false, message:"Please provide details"})
    }
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

    // Check if the email is already registered
    const existingContractor = await ContractorModel.findOne({ email });
    if (existingContractor) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const savedContractor = await ContractorModel.create(data);
    return res.status(201).json({status: true, data:savedContractor })

  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};



// Update contractor's profile


