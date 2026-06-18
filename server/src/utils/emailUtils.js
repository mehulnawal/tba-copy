const nodemailer = require("nodemailer");
const ApiError = require("./ApiError");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } = process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASSWORD) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT) || 587,
    secure: Number(EMAIL_PORT) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
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

  await mailTransporter.sendMail({
    from: `"TBA – The Brilliance Atelier" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

const isEmailConfigured = () => Boolean(getTransporter());

module.exports = { sendEmail, isEmailConfigured };
