const nodemailer = require("nodemailer");
const ApiError = require("./ApiError");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASSWORD
  ) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  const mailTransporter = getTransporter();

  if (!mailTransporter) {
    throw new ApiError(
      503,
      "Email service is not configured. Please contact support.",
    );
  }

  await mailTransporter.verify();

  await mailTransporter.sendMail({
    from: `"TBA – The Brilliance Atelier" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = { sendEmail, getTransporter };
