const sendEmail = async ({ to, subject, html }) => {
  const mailTransporter = getTransporter();

  if (!mailTransporter) {
    throw new ApiError(
      503,
      "Email service is not configured. Please contact support.",
    );
  }

  // Debug logs
  console.log("EMAIL CONFIG:", {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    hasPassword: !!process.env.EMAIL_PASSWORD,
  });

  // Verify SMTP connection
  await mailTransporter.verify();
  console.log("✅ SMTP VERIFIED");

  await mailTransporter.sendMail({
    from: `"TBA – The Brilliance Atelier" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log("✅ EMAIL SENT");
};
