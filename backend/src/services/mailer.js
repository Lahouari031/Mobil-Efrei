// Sends the emails of the site (verification code, password reset code).
// - If SMTP_HOST / SMTP_USER / SMTP_PASS are set in .env, a real email is sent (e.g. Gmail with an app password).
// - Otherwise (default for the project), the email is printed in the terminal where the back end runs.
const nodemailer = require('nodemailer');

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
const useSmtp = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

const transport = useSmtp
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : nodemailer.createTransport({ jsonTransport: true }); // builds the email without sending it

async function sendMail({ to, subject, text }) {
  await transport.sendMail({ from: MAIL_FROM || SMTP_USER || "Mobil'Efrei <no-reply@mobilefrei.test>", to, subject, text });
  if (!useSmtp) {
    // Demo mode: show the email in the back-end terminal
    console.log(`\n┌─ 📧 Email to ${to}\n│  ${subject}\n│  ${text}\n└──────────────────────────────\n`);
  }
}

// Codes can only be delivered if a real SMTP server is configured or if we are in development (terminal)
const canDeliverCodes = () => useSmtp || process.env.NODE_ENV === 'development';

module.exports = { sendMail, canDeliverCodes };
