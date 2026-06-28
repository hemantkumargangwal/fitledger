const nodemailer = require('nodemailer');

let cachedTransporter = null;
const hasSmtpConfig = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);
};

const canUseConsoleOtpFallback = () => (
  process.env.ALLOW_CONSOLE_OTP === 'true' || process.env.NODE_ENV !== 'production'
);

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (!hasSmtpConfig()) {
    throw new Error('SMTP configuration is missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.');
  }

  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  return cachedTransporter;
};

const sendPasswordResetOtp = async ({ toEmail, ownerName, otp }) => {
  if (!hasSmtpConfig()) {
    if (!canUseConsoleOtpFallback()) {
      throw new Error('SMTP configuration is missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.');
    }

    console.warn(
      `[DEV OTP] Password reset OTP for ${toEmail} (${ownerName || 'user'}): ${otp}`
    );
    return {
      delivered: false,
      channel: 'console'
    };
  }

  const transporter = getTransporter();
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from: fromAddress,
    to: toEmail,
    subject: 'FitLedger password reset OTP',
    text: `Hi ${ownerName || 'there'}, your FitLedger password reset OTP is ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin-bottom: 8px;">FitLedger Password Reset</h2>
        <p>Hi ${ownerName || 'there'},</p>
        <p>Your OTP for resetting the password is:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 16px 0; color: #d97706;">
          ${otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `
  });

  return {
    delivered: true,
    channel: 'smtp'
  };
};

module.exports = {
  sendPasswordResetOtp
};
