import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
let fileName = fileURLToPath(import.meta.url);
let __dirName = dirname(fileName);
let parentDir = join(__dirName, "..");
let configPath = join(parentDir, "config.env");
dotenv.config({ path: configPath });
import axios from "axios";
import querystring from "querystring";
import fs from "node:fs";
import { bucket, bucketName } from "../Utils/googleStorage.js";

export const getUserConsent = (req, res) => {
  // Redirect user to Microsoft login page for consent
  const authParams = querystring.stringify({
    client_id: process.env.MICROSOFT_CLIENT_ID,
    response_type: "code",
    redirect_uri:
      "https://braided-complex-403612.el.r.appspot.com/api/get-access-token-microsoft",
    scope: "https://graph.microsoft.com/.default",
    state: "AjileDone",
  });
  const authUrl = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENET_ID}/oauth2/v2.0/authorize?${authParams}`;

  res.redirect(authUrl);
};

export const microsoftLoginController = async (req, res) => {
  try {
    const code = req.query.code;

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${process.env.MICROSOFT_TENET_ID}/oauth2/v2.0/token`,
      querystring.stringify({
        grant_type: "authorization_code",
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        code: code,
        redirect_uri:
          "https://braided-complex-403612.el.r.appspot.com/api/get-access-token-microsoft",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Now you can use the access token to make authorized requests to Microsoft Graph API
    // Set the access token as a cookie
    res.cookie("accessToken", accessToken, {
      domain: "localhost",
      httpOnly: false, // Make the cookie accessible only via HTTP (not JavaScript)
      sameSite: "strict", // Enforce same-site policy for security
      maxAge: 36000, // Set the cookie expiration time in seconds (e.g., 1 day)
      path: "/", // Set the cookie path to '/' so it's accessible across the entire site
    });

    console.log(accessToken);

    // Redirect to the frontend URL
    res.redirect("https://driven-utility-403612.el.r.appspot.com"); // Adjust this URL as needed
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: error });
  }
};

export const sendMailFromContractorMail = async (req, res) => {
  try {
    // Access token from the session or database
    const { accessToken, OrganizationMail } = req.body;

    if (!accessToken) {
      return res.status(401).json({
        status: false,
        message: "Invalid Auth. Access Token is not provided",
      });
    }

    const TimesheetFile = req.file;

    if (!TimesheetFile) {
      return res
        .status(422)
        .json({ status: false, message: "Timesheet CSV file is not given" });
    }

    // Email data with attachments
    const emailData = {
      message: {
        subject: "Timesheet for current month",
        body: {
          contentType: "Text",
          content:
            "Hello , This is My Timesheet for the current month. Please take a look into it and let me know for approval",
        },
        toRecipients: [
          {
            emailAddress: {
              address: OrganizationMail,
            },
          },
        ],
        attachments: [
          {
            "@odata.type": "#microsoft.graph.fileAttachment",
            name: "Timesheet.csv", // Set the desired name for the attachment
            contentBytes: TimesheetFile.buffer.toString("base64"), // Convert the file to base64
          },
        ],
      },
    };

    // Send email using Microsoft Graph API
    const response = await axios.post(
      "https://graph.microsoft.com/v1.0/me/sendMail",
      emailData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Email sent:", response);

    if (response.statusText === "Accepted") {
      res.status(201).json({
        status: true,
        message: "Email sent successfully with attachments.",
      });
    }
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Error sending email with attachments.");
  }
};
