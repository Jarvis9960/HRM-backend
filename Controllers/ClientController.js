import moment from "moment";
import ClientModel from "../Models/ClientModel.js";
import ContractorProfileModel from "../Models/ContractorProfileModel.js";
import POModel from "../Models/POModel.js";

export const createClient = async (req, res) => {
  try {
    const { clientName, clientEmail } = req.body;

    if (!clientEmail || !clientName) {
      return res.status(422).json({
        status: false,
        message: "Please provide all the required field properly",
      });
    }

    const clientObj = new ClientModel({
      clientName: clientName,
      clientEmail: clientEmail,
    });

    const response = await clientObj.save();

    if (response) {
      return res
        .status(201)
        .json({ status: true, message: "Client Successfully created" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getClientForAdmin = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 9;

    const totalClient = await ClientModel.countDocuments();
    const totalPages = Math.ceil(totalClient / limit);

    const clients = await ClientModel.find()
      .populate("PO")
      .skip((page - 1) * limit)
      .limit(limit);

    if (!clients.length > 0) {
      return res
        .status(404)
        .json({ status: false, message: "Contractors not found" });
    }
    return res.status(200).json({
      status: true,
      data: clients,
      page: page,
      totalPages: totalPages,
    });
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const updateOrganizationOfOrganization = async (req, res) => {
  try {
    const { contractorId, organizationId } = req.body;

    if (!contractorId || !organizationId) {
      return res.status(422).json({
        status: false,
        message: "Please provide all the required field properly",
      });
    }

    const updatedContrator = await ContractorProfileModel.updateOne(
      { _id: contractorId },
      { $push: { Organization: organizationId } }
    );

    if (updatedContrator.acknowledged) {
      return res
        .status(201)
        .json({ status: true, message: "successfully updated organization" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const createPO = async (req, res) => {
  try {
    const {
      clientId,
      poNumber,
      poAmount,
      ValidFrom,
      Validtill,
      POdescription,
      issuerName,
    } = req.body;

    if (
      !clientId ||
      !poAmount ||
      !poNumber ||
      !ValidFrom ||
      !Validtill ||
      !POdescription ||
      !issuerName
    ) {
      return res.status(422).json({
        status: false,
        message: "Please provide all the required field properly",
      });
    }

    // Parse and format the date strings using Moment.js
    const validFromDate = moment(ValidFrom, "YYYY-MM-DD").toDate();
    const validTillDate = moment(Validtill, "YYYY-MM-DD").toDate();

    const newPo = new POModel({
      clientId: clientId,
      PONumber: poNumber,
      POAmount: poAmount,
      ValidFrom: validFromDate,
      ValidTill: validTillDate,
      PODiscription: POdescription,
      IssuerName: issuerName,
    });

    const response = await newPo.save();

    const updateClient = await ClientModel.updateOne(
      { _id: clientId },
      { $push: { PO: response._id } }
    );

    if (updateClient.acknowledged) {
      console.log("PO is added to client");
    }

    if (response) {
      return res.status(201).json({
        status: false,
        message: "PO for this client successfully created",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getPOOfClients = async (req, res) => {
  try {
    const { clientId } = req.body;

    if (!clientId) {
      return res
        .status(422)
        .json({ status: false, message: "Please provide client id to get po" });
    }

    const page = req.query.page || 1;
    const limit = 9;

    const totalPO = POModel.countDocuments();
    const totalPages = Math.ceil(totalPO / limit);

    const PurchaseOrders = await POModel.find({ clientId: clientId })
      .populate("clientId")
      .skip((page - 1) * limit)
      .limit(limit);

    if (!PurchaseOrders.length > 0) {
      return res
        .status(404)
        .json({ status: true, message: "No po are created for this client" });
    }

    return res.status(201).json({
      status: true,
      po: PurchaseOrders,
      page: page,
      totalPages: totalPages,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getSinglePO = async (req, res) => {
  try {
    const { poId } = req.body;

    if (!poId) {
      return res
        .status(422)
        .json({ status: false, message: "No po id is present in query" });
    }

    const getSinglePo = await POModel.findById(poId);

    if (!getSinglePo) {
      return res
        .status(404)
        .json({ status: false, message: "No such po with given id" });
    }

    return res
      .status(202)
      .json({ status: true, message: "successfully fetched PO", singlePO: getSinglePo });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};
