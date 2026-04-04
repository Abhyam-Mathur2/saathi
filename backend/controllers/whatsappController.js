const twilio = require('twilio');
const Report = require('../models/Report');
const groqService = require('../services/groqService');
const localStore = require('../services/localStore');

const normalizePhoneForWhatsApp = (phone) => {
  const raw = String(phone || '').trim();
  if (!raw) {
    return null;
  }

  let digits = raw.replace(/\D/g, '');

  // Convert international prefix 00XXXXXXXX to XXXXXXXXX.
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  // Common malformed format like +091XXXXXXXXXX -> 91XXXXXXXXXX.
  if (digits.startsWith('091')) {
    digits = `91${digits.slice(3)}`;
  }

  // Local Indian mobile format: 0XXXXXXXXXX -> 91XXXXXXXXXX.
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = `91${digits.slice(1)}`;
  }

  if (!digits) {
    return null;
  }

  // Default to India country code for 10-digit local numbers.
  let normalized = digits.length === 10 ? `91${digits}` : digits;

  // E.164 rules: country code + subscriber number, 10-15 digits total and no leading zero.
  normalized = normalized.replace(/^0+/, '');
  if (normalized.length < 10 || normalized.length > 15) {
    return null;
  }

  // App is India-focused: require full +91 followed by a 10-digit mobile number.
  if (!normalized.startsWith('91') || normalized.length !== 12) {
    return null;
  }

  return `whatsapp:+${normalized}`;
};

const buildWhatsAppAiReply = (reportId, parsedData = {}) => {
  const issueType = parsedData.issueType || 'Other';
  const urgency = parsedData.urgency || 5;
  const address = parsedData.location?.address || 'Unknown location';
  const summary = parsedData.description || 'No summary available.';

  return [
    `AI response: I understood this as a ${issueType} issue near ${address}.`,
    `Urgency detected: ${urgency}/10.`,
    `Summary: ${summary}`,
    `Report ID: ${reportId}`,
  ].join(' ');
};

exports.webhook = async (req, res) => {
  const twiml = new twilio.twiml.MessagingResponse();

  try {
    const incomingText = (req.body.Body || '').trim();

    if (!incomingText) {
      twiml.message('Please send a message describing the community need.');
      return res.type('text/xml').status(200).send(twiml.toString());
    }

    const aiData = await groqService.parseUnstructuredText(incomingText);
    const reportPayload = {
      ...aiData,
      isUnstructured: true,
      source: 'whatsapp',
      originalText: incomingText,
      status: 'Pending',
    };

    const report = await localStore.createReport(reportPayload, Report);

    twiml.message(buildWhatsAppAiReply(report._id, aiData));

    return res.type('text/xml').status(200).send(twiml.toString());
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    twiml.message('We could not process your message right now. Please try again.');
    return res.type('text/xml').status(200).send(twiml.toString());
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { to, message } = req.body;
    const from = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!from || !process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return res.status(500).json({ success: false, message: 'Twilio environment variables are missing.' });
    }

    const toWhatsApp = normalizePhoneForWhatsApp(to);
    if (!toWhatsApp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination phone number. Use India format like +919876543210 or 9876543210.',
      });
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const response = await client.messages.create({
      from,
      to: toWhatsApp,
      body: message || 'Hello from VolunteerIQ.',
    });

    return res.status(200).json({
      success: true,
      message: 'WhatsApp message sent successfully.',
      sid: response.sid,
      to: toWhatsApp,
    });
  } catch (error) {
    console.error('Twilio send message error:', error?.message || error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to send WhatsApp message.',
    });
  }
};
