import ourOrganizationModel from "../Models/OurOrganizationModel.js";

export const createOurOrganization = async (req, res) => {
  try {
    const { legalName, gst, address } = req.body;

    if (!legalName || !gst || !address) {
      return res.status(422).json({
        status: false,
        message: "Please provide all the required field properly",
      });
    }

    const newOurOrganization = new ourOrganizationModel({
      LegalName: legalName,
      GST: gst,
      Address: address,
    });

    const savedOurOrganization = await newOurOrganization.save();

    if (savedOurOrganization) {
      return res.status(201).json({
        status: true,
        message: "Successfully created our organization",
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong", err: error });
  }
};

export const getOurOwnOrganization = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 9;

    const totalDocuments = await ourOrganizationModel.find().countDocuments();
    const totalPage = Math.ceil(totalDocuments / limit);

    const getOwnOrganization = await ourOrganizationModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit);

    if (getOwnOrganization.length < 1) {
      return res
        .status(404)
        .json({ status: true, message: "No Organization is present" });
    }

    return res.status(202).json({
      status: true,
      message: "successfully fetched our organization",
      totalPage: totalPage,
      currentPage: page,
      response: getOwnOrganization,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({status: false, message: "something went wrong", err: error})
  }
};
