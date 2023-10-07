import poInvoiceModel from "../Models/PoInvoiceModel.js";

export const createPoInvoice = async (req, res) => {
  try {
    const {
      poId,
      contractorId,
      name,
      address,
      gstInUiIn,
      invoiceNumber,
      amount,
    } = req.body;

    if (
      !poId ||
      !contractorId ||
      !name ||
      !address ||
      !gstInUiIn ||
      invoiceNumber ||
      !amount
    ) {
      return res.status(422).json({
        status: false,
        message: "Please provide all the required field properly",
      });
    }

    const createNewPoInvoice = new poInvoiceModel({
      Poid: poId,
      ContractorId: contractorId,
      Name: name,
      Address: address,
      GSTInUIn: gstInUiIn,
      InvoiceNumber: invoiceNumber,
      Amount: amount,
    });

    const savedResponse = await createNewPoInvoice.save();

    if (savedResponse) {
      return res.status(201).json({
        status: true,
        message: "Invoice successfully created",
        savedResponse,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getInvoicesForPoContractor = async (req, res) => {
  try {
    const { poId, contractorId } = req.query;

    if (!poId || !contractorId) {
      return res.status(422).json({
        status: false,
        message: "Please provide po id and contractor id for invoices",
      });
    }

    const savedInvoices = await poInvoiceModel.find({
      Poid: poId,
      ContractorId: contractorId,
    });

    if (savedInvoices.length < 0) {
      return res.status(202).json({
        status: true,
        message: "There is no invoice present for contractor",
      });
    }

    return res.status(202).json({
      status: true,
      message: "successfully fetched invoices for contractor",
      invoices: savedInvoices,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getSingleInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.query;

    if (!invoiceId) {
      return res
        .status(422)
        .json({ status: false, message: "Invalid invoice id" });
    }

    const savedInvoice = await poInvoiceModel
      .findOne({ _id: invoiceId })
      .populate("Poid", "ContractorId");

    if (savedInvoice) {
      return res.status(202).json({
        status: true,
        message: "successfully fetched single invoice",
        singleInvoice: savedInvoice,
      });
    } else {
      throw new Error("Invalid invoiceId");
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};
