// email.js — sends real email via nodemailer IF SMTP_* env vars are set.
// If they're not set (e.g. local dev, or this demo), it logs the email to
// the console instead of throwing an error, so the rest of the app keeps
// working without a mail provider configured.
//
// To send real email in production: sign up with an SMTP provider (e.g.
// SendGrid, Mailgun, Amazon SES, or plain Gmail SMTP for testing), then
// fill in SMTP_HOST/PORT/USER/PASS and SMTP_FROM in .env.

const nodemailer = require('nodemailer');

function getTransport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendMail({ to, subject, text, attachments }) {
  const transport = getTransport();
  if (!transport) {
    console.log('--- EMAIL NOT SENT (no SMTP configured) ---');
    console.log('To:', to, '| Subject:', subject);
    console.log(text);
    console.log('Attachments:', (attachments || []).map(a => a.filename));
    console.log('--------------------------------------------');
    return { simulated: true };
  }
  return transport.sendMail({ from: process.env.SMTP_FROM, to, subject, text, attachments });
}

module.exports = { sendMail };
