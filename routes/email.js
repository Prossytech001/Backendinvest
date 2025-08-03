const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.CONTACT_HOST, // smtp-relay.brevo.com
  port: parseInt(process.env.CONTACT_PORT), // 465
  secure: true, // true for port 465
  auth: {
    user: process.env.CONTACT_EMAIL, // your Brevo login
    pass: process.env.CONTACT_EMAIL_PASSWORD, // your Brevo SMTP password
  },
  tls: {
    rejectUnauthorized: false, // 👈 Allow self-signed certs
  },
});

router.post("/send-email", async (req, res) => {
  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await transporter.sendMail({
      from: `"XTRADE" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    res.status(200).json({ message: "✅ Email sent successfully" });
  } catch (error) {
    console.error("❌ Brevo Email Error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

module.exports = router;
