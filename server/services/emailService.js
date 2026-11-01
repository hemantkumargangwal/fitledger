const nodemailer = require('nodemailer');
const https = require('https');

let cachedTransporter = null;
const MSG91_EMAIL_DEFAULTS = Object.freeze({
  fromName: 'FitSaarthi',
  fromEmail: '',
  domain: ''
});

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
    subject: 'FitSaarthi password reset OTP',
    text: `Hi ${ownerName || 'there'}, your FitSaarthi password reset OTP is ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin-bottom: 8px;">FitSaarthi Password Reset</h2>
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

const getMsg91EmailConfig = () => {
  if (!process.env.MSG91_AUTH_KEY) {
    return null;
  }
  return {
    authKey: process.env.MSG91_AUTH_KEY,
    fromName: process.env.MSG91_FROM_NAME || MSG91_EMAIL_DEFAULTS.fromName,
    fromEmail: process.env.MSG91_EMAIL_FROM || MSG91_EMAIL_DEFAULTS.fromEmail,
    domain: process.env.MSG91_EMAIL_DOMAIN || MSG91_EMAIL_DEFAULTS.domain,
    templateId: process.env.MSG91_EMAIL_TEMPLATE_ID || 'global_otp'
  };
};

const sendMsg91EmailRequest = (payload, authKey) => new Promise((resolve, reject) => {
  console.log("payload", payload);
  const request = https.request({
    method: 'POST',
    hostname: 'control.msg91.com',
    path: '/api/v5/email/send',
    headers: {
      accept: 'application/json',
      authkey: authKey,
      'content-type': 'application/json'
    }
  }, (response) => {
    console.log('request sent to msg91');
    console.log("response", response);
    const chunks = [];
    response.on('data', (chunk) => chunks.push(chunk));
    response.on('end', () => {
      const body = Buffer.concat(chunks).toString();
      const isSuccess = response.statusCode >= 200 && response.statusCode < 300;

      if (!isSuccess) {
        return reject(new Error(`MSG91 email failed (${response.statusCode}): ${body}`));
      }

      if (!body) return resolve({});

      try {
        resolve(JSON.parse(body));
      } catch (_error) {
        resolve({ rawResponse: body });
      }
    });
  });

  request.setTimeout(10000, () => request.destroy(new Error('MSG91 welcome email request timed out')));
  request.on('error', reject);
  request.write(JSON.stringify(payload));
  request.end();
});

/**
 * Send any MSG91 template email. Callers only need to supply the template ID,
 * recipient, and template variables; credentials stay in server environment variables.
 */
const sendMsg91TemplateEmail = async ({
  toEmail,
  recipientName,
  companyName,
  templateId,
  variables = {}
}) => {
  if (!toEmail) {
    return { delivered: false, channel: 'msg91', reason: 'recipient_email_missing' };
  }
  console.log("toEmail", toEmail);
  console.log("recipientName", recipientName);
  console.log("companyName", companyName);
  console.log("templateId", templateId);
  console.log("variables", variables);

  const data = getMsg91EmailConfig();
  console.log("data", data);
  if (!data) {
    return { delivered: false, channel: 'msg91', reason: 'msg91_not_configured' };
  }
  const providerResponse = await sendMsg91EmailRequest({
    recipients: [{
      to: [{ name: recipientName || toEmail, email: toEmail }],
      variables: { ...variables }
    }],
    from: { name: companyName || data.fromName, email: data.fromEmail },
    domain: data.domain,
    template_id: templateId || data.templateId,
    validate_before_send: false
  }, data.authKey);
  console.log("providerResponse", providerResponse);

  return { delivered: true, channel: 'msg91', templateId: templateId || data.templateId, providerResponse };
};

const sendMemberWelcomeEmail = async ({ toEmail, memberName, gymName }) => {
  return sendMsg91TemplateEmail({
    toEmail,
    recipientName: memberName,
    companyName: gymName,
    // This key must match the variable configured in the MSG91 welcome template.
    variables: {
      GYM_NAME: gymName || 'FitSaarthi'
    },
    templateId: process.env.MSG91_TEMPLATE_WELCOME
  });
};

const sendEnrollmentInvitationEmail = async ({ toEmail, gymName, gymContact, enrollmentUrl }) => {
  return sendMsg91TemplateEmail({
    toEmail,
    recipientName: 'New member',
    companyName: gymName,
    templateId: process.env.MSG91_TEMPLATE_ENROLLMENT,
    variables: {
      gym_name: gymName || 'FitSaarthi',
      registration_form_link: enrollmentUrl,
      gym_contact: gymContact || ''
    }
  });
};

module.exports = {
  sendPasswordResetOtp,
  sendMemberWelcomeEmail,
  sendEnrollmentInvitationEmail,
  sendMsg91TemplateEmail
};
