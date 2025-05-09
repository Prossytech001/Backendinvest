// routes/contact.js
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.CONTACT_EMAIL,
        pass: process.env.CONTACT_EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // <- Add this to bypass SSL validation errors
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.CONTACT_EMAIL,
      subject: `New Message from ${name}: ${subject}`,
      html: `
        <h3>Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ message: "Failed to send message." });
  }
});

module.exports = router;
