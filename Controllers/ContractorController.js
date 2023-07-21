import ContractorModel from "../Models/ContractorModel.js";
import ContractorProfileModel from "../Models/ContractorProfileModel.js";

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
    console.log(files)
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
      return res.status(422).json({
        status: "false",
        message: "Please fill all the required fields",
      });
    } else if (
      !beneficiaryName.match(nameregex) ||
      !actualName.match(nameregex)
    ) {
      return res
        .status(422)
        .json({ status: false, message: "Please provide valid name" });
    }

    const sameActualPanNo = await ContractorProfileModel.findOne({
      ActualPanNo: actualPanNo,
    });
    const sameActualAadhar = await ContractorProfileModel.findOne({
      ActualAadharNo: actualAadharNo,
    });

    // if (sameActualPanNo || sameActualAadhar) {
    //   res
    //     .status(422)
    //     .json({ status: false, message: "Actual id already exist" });
    // }

    const sameBeneficiaryAadhar = await ContractorProfileModel.findOne({
      BeneficiaryAadharNo: beneficiaryAadharNo,
    });
    const sameBeneficiaryPan = await ContractorProfileModel.findOne({ BeneficiaryPanNo: beneficiaryPanNo});

    // if(sameBeneficiaryAadhar || sameBeneficiaryPan){
    //   res
    //   .status(422)
    //   .json({ status: false, message: "Beneficiary id already exist" });
    // }
    const actualPanLink = files.actualPanImage.path
    const actualAadharLink = files.actualAdharImage.path
    const beneficiaryPanLink = files.beneficiaryPanImage.path
    const beneficiaryAadharLink = files.beneficiaryAadharImage.path

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
      JoinDate: joinDate,
      Birthday: birthday,
      Address: address,
      Gender: gender,
      ReportTo: reportTo,
      Nationality: nationality,
      Religion: religion,
      EmergencyContactName: emergencyContactName,
      EmergencyContactRelation: emergencyContactRelation,
      EmergencyContactNumber: emergencyContactNumber,
    });
    res.status(201).json({ status: true, message: updatecontractorprofile });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
