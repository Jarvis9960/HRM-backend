import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    Message: {
      type: String,
      required: true,
    },
    Profile: [
      {
        type: {
          type: String,
          enum: ["Admin", "Contractor"],
        },
        ref: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "Profile.type",
        },
      },
    ],
    read: {
      type: Boolean,
      default: false,
    },
    NotificationFor: {
      type: String,
      required: true,
    },
    Icon: {
      type: Boolean,
      default: false,
    },
    Type: {
      type: String,
    }
  },
  { timestamps: true }
);

const NotificationModel = mongoose.model("notification", notificationSchema);

export default NotificationModel;
