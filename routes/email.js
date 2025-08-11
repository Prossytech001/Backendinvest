// const express = require("express");
// const router = express.Router();
// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: process.env.CONTACT_HOST, // smtp-relay.brevo.com
//   port: parseInt(process.env.CONTACT_PORT), // 465
//   secure: true, // true for port 465
//   auth: {
//     user: process.env.CONTACT_EMAIL, // your Brevo login
//     pass: process.env.CONTACT_EMAIL_PASSWORD, // your Brevo SMTP password
//   },
//   tls: {
//     rejectUnauthorized: false, // 👈 Allow self-signed certs
//   },
// });

// router.post("/send-email", async (req, res) => {
//   const { to, subject, html } = req.body;

//   if (!to || !subject || !html) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   try {
//     await transporter.sendMail({
//       from: `"XTRADE" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html,
//     });

//     res.status(200).json({ message: "✅ Email sent successfully" });
//   } catch (error) {
//     console.error("❌ Brevo Email Error:", error);
//     res.status(500).json({ error: "Failed to send email" });
//   }
// });

// module.exports = router;
// routes/sendEmail.js
// const express = require("express");
// const nodemailer = require("nodemailer");
// const router = express.Router();

// // Auto-pick secure based on port
// const PORT = Number(process.env.CONTACT_PORT || 587);
// const SECURE = PORT === 465;

// // Create transporter
// const transporter = nodemailer.createTransport({
//   host: process.env.CONTACT_HOST || "smtp-relay.brevo.com",
//   port: PORT, // 465 (SSL) or 587 (STARTTLS)
//   secure: SECURE,
//   auth: {
//     user: process.env.CONTACT_EMAIL,            // Brevo SMTP login (verified sender)
//     pass: process.env.CONTACT_EMAIL_PASSWORD,   // Brevo SMTP key
//   },
//   tls: { rejectUnauthorized: false }, // ok if you need this
// });

// // Optional: verify on boot
// transporter.verify().then(() => {
//   console.log("SMTP ready");
// }).catch(err => {
//   console.error("SMTP verify error:", err.message);
// });

// // Extract emails from any string (commas/semicolons/newlines + "Name <email>")
// function parseRecipients(input) {
//   if (!input) return [];
//   const emailRegex = /([^\s<>"',;]+@[^\s<>"',;]+\.[^\s<>"',;]+)/g;
//   const out = String(input).match(emailRegex) || [];
//   return [...new Set(out.map(e => e.trim()))];
// }

// router.post("/send-email", async (req, res) => {
//   try {
//     const { to, subject, html, cc, bcc, replyTo } = req.body || {};

//     const toList = parseRecipients(to);
//     const ccList = parseRecipients(cc);
//     const bccList = parseRecipients(bcc);

//     if (!toList.length) {
//       return res.status(400).json({ error: "No valid recipients in 'to'." });
//     }
//     if (!subject || !html) {
//       return res.status(400).json({ error: "Missing required fields: subject/html." });
//     }

//     // Use a verified sender (Brevo): e.g., no-reply@yourdomain.com
//     const fromDisplay = process.env.FROM_DISPLAY || "XTRADE";
//     const fromEmail = process.env.CONTACT_EMAIL; // must be verified in Brevo
//     const from = `${fromDisplay} <${fromEmail}>`;

//     const info = await transporter.sendMail({
//       from,
//       to: toList, // array or comma string both fine
//       cc: ccList.length ? ccList : undefined,
//       bcc: bccList.length ? bccList : undefined,
//       replyTo: replyTo || undefined,
//       subject,
//       html,
//       // Force envelope to avoid EENVELOPE edge cases
//       envelope: {
//         from: fromEmail,
//         to: toList,
//         cc: ccList.length ? ccList : undefined,
//         bcc: bccList.length ? bccList : undefined,
//       },
//     });

//     res.status(200).json({
//       ok: true,
//       messageId: info.messageId,
//       accepted: info.accepted,
//       rejected: info.rejected,
//     });
//   } catch (error) {
//     console.error("❌ Brevo Email Error:", error);
//     res.status(500).json({ error: error?.message || "Failed to send email" });
//   }
// });

// module.exports = router;
// const express = require("express");
// const nodemailer = require("nodemailer");
// const router = express.Router();

// const PORT = Number(process.env.CONTACT_PORT || 465);
// const SECURE = PORT === 465;

// const transporter = nodemailer.createTransport({
//   host: process.env.CONTACT_HOST, // smtp.gmail.com
//   port: PORT,
//   secure: SECURE,
//   auth: {
//     user: process.env.CONTACT_EMAIL,
//     pass: process.env.CONTACT_EMAIL_PASSWORD, // Gmail App Password
//   },
//   tls: { rejectUnauthorized: false },
// });

// function parseRecipients(input) {
//   if (!input) return [];
//   const emailRegex = /([^\s<>"',;]+@[^\s<>"',;]+\.[^\s<>"',;]+)/g;
//   const found = String(input).match(emailRegex) || [];
//   return [...new Set(found.map(e => e.trim()))];
// }

// router.post("/send-email", async (req, res) => {
//   try {
//     const { to, subject, html } = req.body || {};
//     const toList = parseRecipients(to);

//     if (!toList.length) {
//       return res.status(400).json({ error: "No valid recipients" });
//     }
//     if (!subject || !html) {
//       return res.status(400).json({ error: "Subject and HTML are required" });
//     }

//     const fromDisplay = process.env.FROM_DISPLAY || "XTRADE";
//     const fromEmail = process.env.CONTACT_EMAIL;

//     const info = await transporter.sendMail({
//       from: `${fromDisplay} <${fromEmail}>`,
//       to: toList,
//       subject,
//       html,
//       envelope: {
//         from: fromEmail,
//         to: toList,
//       },
//     });

//     res.json({ ok: true, messageId: info.messageId });
//   } catch (err) {
//     console.error("❌ Gmail SMTP Error:", err);
//     res.status(500).json({ error: err.message || "Failed to send" });
//   }
// });

// module.exports = router;
const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

const PORT = Number(process.env.CONTACT_PORT || 465);
const SECURE = PORT === 465;

const transporter = nodemailer.createTransport({
  host: process.env.CONTACT_HOST, // e.g. smtp.gmail.com
  port: PORT,
  secure: SECURE,
  auth: {
    user: process.env.CONTACT_EMAIL,            // Gmail address
    pass: process.env.CONTACT_EMAIL_PASSWORD,   // Gmail App Password
  },
  tls: { rejectUnauthorized: false },
});

// Normalizes many shapes -> array of clean emails
function parseRecipients(raw) {
  // Accept: string, array, object(s) with { address } or { email }
  if (!raw) return [];

  let list = [];
  if (Array.isArray(raw)) {
    list = raw.flat();
  } else if (typeof raw === "object") {
    // { address: "..."} or { email: "..."} or { to: "..." }
    const guess =
      raw.address || raw.email || raw.to || raw.value || JSON.stringify(raw);
    list = [guess];
  } else {
    list = [raw];
  }

  const emailRegex =
    /([^\s<>"',;]+@[^\s<>"',;]+\.[^\s<>"',;]+)/g;

  const out = [];

  for (const item of list) {
    if (typeof item !== "string") continue;
    // Split common separators first
    const chunks = item.split(/[\n,;]+/);
    for (let c of chunks) {
      c = c.trim();
      if (!c) continue;
      // Pull email from things like "Name <email@x.com>"
      const match = c.match(emailRegex);
      if (match) out.push(...match.map((m) => m.trim()));
    }
  }

  // de-dupe
  return [...new Set(out)];
}

router.post("/send-email", async (req, res) => {
  try {
    // Ensure body parsing middleware is enabled in app.js:
    // app.use(express.json());
    const { to, subject, html, cc, bcc, replyTo } = req.body || {};

    // DEBUG (remove after fixing)
    console.log("RAW to from client:", to);

    const toList = parseRecipients(to);
    const ccList = parseRecipients(cc);
    const bccList = parseRecipients(bcc);

    console.log("PARSED toList:", toList); // DEBUG

    if (!toList.length) {
      return res.status(400).json({ error: "No valid recipients" });
    }
    if (!subject || !html) {
      return res.status(400).json({ error: "Subject and HTML are required" });
    }

    const fromDisplay = process.env.FROM_DISPLAY || "XTRADE";
    const fromEmail = process.env.CONTACT_EMAIL;
    const from = `${fromDisplay} <${fromEmail}>`;

    const info = await transporter.sendMail({
      from,
      to: toList,
      cc: ccList.length ? ccList : undefined,
      bcc: bccList.length ? bccList : undefined,
      replyTo: replyTo || undefined,
      subject,
      html,
      envelope: {
        from: fromEmail,
        to: toList,
        cc: ccList.length ? ccList : undefined,
        bcc: bccList.length ? bccList : undefined,
      },
    });

    return res.json({
      ok: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    });
  } catch (err) {
    console.error("❌ SMTP Error:", err);
    return res.status(500).json({ error: err?.message || "Failed to send" });
  }
});

module.exports = router;
