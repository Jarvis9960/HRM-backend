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

export const getUserConsent = (req, res) => {
  // Redirect user to Microsoft login page for consent
  const authParams = querystring.stringify({
    client_id: process.env.MICROSOFT_CLIENT_ID,
    response_type: "code",
    redirect_uri: "http://localhost:5000/api/get-access-token-microsoft",
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
        redirect_uri: "http://localhost:5000/api/get-access-token-microsoft",
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
      domain: 'localhost',
      httpOnly: true, // Make the cookie accessible only via HTTP (not JavaScript)
      sameSite: "strict", // Enforce same-site policy for security
      maxAge: 3600, // Set the cookie expiration time in seconds (e.g., 1 hour)
      path: "/", // Set the cookie path to '/' so it's accessible across the entire site
    });

    // Redirect to the frontend URL
    res.redirect("http://localhost:3000"); // Adjust this URL as needed
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: error });
  }
};

export const sendMailFromContractorMail = async (req, res) => {
  try {
    // Access token from the session or database
    const accessToken = req.body.accessToken;

    console.log(accessToken);

    // Email data with attachments
    const emailData = {
      message: {
        subject: "Hello from My App",
        body: {
          contentType: "Text",
          content: "This is the email content.",
        },
        toRecipients: [
          {
            emailAddress: {
              address: "durgesh.rajak@ajiledone.com",
            },
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
    res.send("Email sent successfully with attachments.");
  } catch (error) {
    console.error("Error sending email:", error.response.data);
    res.status(500).send("Error sending email with attachments.");
  }
};
