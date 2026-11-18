import transporter from "../config/nodemailer.js";
import dotenv from "dotenv" 


dotenv.config()
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
  finally {
    console.log("email sent to user",to)
  }
};

export default sendEmail;