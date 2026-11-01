const https = require('https');
const { sendMsg91TemplateEmail } = require('./emailService');

const postMsg91 = (path, payload) => new Promise((resolve, reject) => {
  const authKey = process.env.MSG91_AUTH_KEY;
  if (!authKey) return reject(new Error('MSG91_AUTH_KEY is not configured.'));

  const request = https.request({
    method: 'POST',
    hostname: 'control.msg91.com',
    path,
    headers: { accept: 'application/json', authkey: authKey, 'content-type': 'application/json' }
  }, (response) => {
    const chunks = [];
    response.on('data', (chunk) => chunks.push(chunk));
    response.on('end', () => {
      const body = Buffer.concat(chunks).toString();
      if (response.statusCode < 200 || response.statusCode >= 300) {
        return reject(new Error(`MSG91 request failed (${response.statusCode}).`));
      }
      try { return resolve(body ? JSON.parse(body) : {}); } catch (_error) { return resolve({}); }
    });
  });

  request.setTimeout(15000, () => request.destroy(new Error('MSG91 request timed out.')));
  request.on('error', reject);
  request.write(JSON.stringify(payload));
  request.end();
});

const normalizeIndianPhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return '';
};

const sendMemberEmail = async ({ members, message, gymName }) => {
  const templateId = process.env.MSG91_MEMBER_EMAIL_TEMPLATE_ID;
  if (!process.env.MSG91_AUTH_KEY || !templateId) {
    throw new Error('MSG91 email authentication or member template is not configured.');
  }

  const recipients = members.filter((member) => member.email);
  const results = await Promise.allSettled(recipients.map((member) => sendMsg91TemplateEmail({
    toEmail: member.email,
    recipientName: member.name,
    companyName: gymName,
    templateId,
    variables: { member_name: member.name, message }
  })));
  const delivered = results.filter((result) => result.status === 'fulfilled' && result.value.delivered).length;
  return { attempted: recipients.length, delivered, skipped: members.length - recipients.length + results.length - delivered };
};

const sendMemberSms = async ({ members, message }) => {
  const templateId = process.env.MSG91_MEMBER_SMS_TEMPLATE_ID;
  if (!templateId) throw new Error('MSG91_MEMBER_SMS_TEMPLATE_ID is not configured.');

  const recipients = members
    .map((member) => ({ member, mobile: normalizeIndianPhone(member.phone) }))
    .filter(({ mobile }) => mobile)
    .map(({ member, mobile }) => ({ mobiles: mobile, member_name: member.name, message }));
  if (!recipients.length) return { attempted: 0, delivered: 0, skipped: members.length };

  await postMsg91('/api/v5/flow', { template_id: templateId, recipients });
  return { attempted: recipients.length, delivered: recipients.length, skipped: members.length - recipients.length };
};

const sendMemberWhatsApp = async ({ members, message }) => {
  const integratedNumber = process.env.MSG91_WHATSAPP_INTEGRATED_NUMBER;
  const templateName = process.env.MSG91_MEMBER_WHATSAPP_TEMPLATE_NAME;
  const languageCode = process.env.MSG91_MEMBER_WHATSAPP_LANGUAGE || 'en';
  if (!integratedNumber || !templateName) {
    throw new Error('MSG91 WhatsApp sender number or member template is not configured.');
  }

  const recipients = members
    .map((member) => ({ member, mobile: normalizeIndianPhone(member.phone) }))
    .filter(({ mobile }) => mobile)
    .map(({ member, mobile }) => ({
      to: [mobile],
      components: { body_1: { type: 'text', value: message } }
    }));
  if (!recipients.length) return { attempted: 0, delivered: 0, skipped: members.length };

  await postMsg91('/api/v5/whatsapp/whatsapp-outbound-message/bulk/', {
    integrated_number: integratedNumber,
    content_type: 'template',
    payload: {
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode, policy: 'deterministic' },
        to_and_components: recipients
      }
    }
  });
  return { attempted: recipients.length, delivered: recipients.length, skipped: members.length - recipients.length };
};

const sendMemberMessage = async ({ channel, members, message, gymName }) => {
  if (channel === 'email') return sendMemberEmail({ members, message, gymName });
  if (channel === 'sms') return sendMemberSms({ members, message });
  if (channel === 'whatsapp') return sendMemberWhatsApp({ members, message });
  throw new Error('Unsupported message channel.');
};

module.exports = { sendMemberMessage };
