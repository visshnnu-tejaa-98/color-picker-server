import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp-gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

export const sendEMailToUser = async (options) => {
  const { name, address, recieverEmail, subject, html } = options;
  let mailOptions = {
    from: {
      name,
      address,
    },
    to: recieverEmail,
    subject,
    html,
  };
  sendMail(mailOptions);
};

const sendMail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
