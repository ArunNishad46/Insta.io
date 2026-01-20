import apiInstance from "../config/brevo.js";
import dotenv from 'dotenv';
dotenv.config();

const sendEmail = async ({ to, subject, html }) => {
  try {
    await apiInstance.sendTransacEmail({
      sender: {
        name: "Instaio | Social Media App",
        email: process.env.EMAIL_FROM,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html
    });
  } catch (error) {
    console.error("Email send failed:", error.message);
  }
};

export default sendEmail;
