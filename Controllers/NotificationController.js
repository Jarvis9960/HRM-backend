import NotificationModel from "../Models/Notification.js";

export const getNotificationForAdmin = async (req, res) => {
  try {
    const adminId = req.user._id;

    const getNotification = await NotificationModel.find({
      "Profile.type": "Admin",
      "Profile.ref": adminId,
      NotificationFor: "Admin",
    })
      .populate("Profile.ref")
      .populate({
        path: "Profile",
        match: { type: "Contractor" }, // Filter to populate only 'Contractor' references
        populate: { path: "ref" }, // Populate the 'Contractor' reference
      })
      .sort({ createdAt: -1 });

    if (getNotification.length < 1) {
      return res.status(202).json({
        status: true,
        message: "No notification are currently in database",
      });
    }

    return res.status(202).json({
      status: true,
      message: "successfully fetched notification",
      getNotification,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getNotificationforContractors = async (req, res) => {
  try {
    const contractorId = req.user._id;

    const getNotification = await NotificationModel.find({
      "Profile.type": "Contractor",
      "Profile.ref": contractorId,
      NotificationFor: "Contractor",
    })
      .populate("Profile.ref")
      .populate({
        path: "Profile",
        match: { type: "Contractor" }, // Filter to populate only 'Contractor' references
        populate: { path: "ref" }, // Populate the 'Contractor' reference
      })
      .sort({ createdAt: -1 });

    if (getNotification.length < 1) {
      return res.status(202).json({
        status: true,
        message: "No notification are currently in database",
      });
    }

    return res.status(202).json({
      status: true,
      message: "successfully fetched notification",
      getNotification,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const makeNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.body;

    if (!notificationId) {
      return res
        .status(422)
        .json({ status: false, message: "Notification id is not given" });
    }

    const makeRead = await NotificationModel.updateOne(
      { _id: notificationId },
      { $set: { read: true } }
    );

    if (makeRead.acknowledged) {
      return res
        .status(201)
        .json({ status: true, message: "Notification Readed" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};


