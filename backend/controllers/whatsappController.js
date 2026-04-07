const twilio = require('twilio');
const Report = require('../models/Report');
const groqService = require('../services/groqService');
const localStore = require('../services/localStore');

const ISSUE_TYPES = ['Food', 'Health', 'Education', 'Infrastructure', 'Safety', 'Environment', 'Other'];
const DEFAULT_COORDINATES = [77.1025, 28.7041];
const activeConversations = new Map();

const canonicalIssueType = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const match = ISSUE_TYPES.find((issue) => issue.toLowerCase() === normalized);
  return match || null;
};

const ISSUE_KEYWORDS = {
  Food: ['food', 'meal', 'ration', 'hunger', 'bhook', 'khana', 'ann'],
  Health: ['health', 'medical', 'medicine', 'doctor', 'hospital', 'injury', 'kit', 'ambulance'],
  Education: ['education', 'school', 'college', 'teacher', 'class', 'exam', 'student'],
  Infrastructure: ['infrastructure', 'road', 'bridge', 'drain', 'water', 'electricity', 'power', 'toilet'],
  Safety: ['safety', 'security', 'crime', 'police', 'violence', 'harassment', 'danger', 'unsafe'],
  Environment: ['environment', 'pollution', 'garbage', 'waste', 'drainage', 'air', 'waterlogging', 'sewage'],
};

const inferIssueTypeFromKeywords = (text) => {
  const normalized = String(text || '').trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  for (const [issueType, keywords] of Object.entries(ISSUE_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return issueType;
    }
  }

  return null;
};

const resolveIssueTypeFromUserText = async (text) => {
  const exactType = canonicalIssueType(text);
  if (exactType) {
    return exactType;
  }

  const keywordType = inferIssueTypeFromKeywords(text);
  if (keywordType) {
    return keywordType;
  }

  try {
    const parsed = await groqService.parseUnstructuredText(text);
    return canonicalIssueType(parsed?.issueType);
  } catch (error) {
    console.error('Issue type inference error:', error?.message || error);
    return null;
  }
};

const parseUrgency = (value) => {
  const numeric = Number.parseInt(String(value || '').trim(), 10);
  if (Number.isNaN(numeric) || numeric < 1 || numeric > 10) {
    return null;
  }
  return numeric;
};

const startGuidedFlow = (sender) => {
  activeConversations.set(sender, {
    step: 'description',
    data: {
      issueType: 'Other',
      urgency: 5,
      address: 'Unknown location',
    },
  });
};

const clearGuidedFlow = (sender) => {
  activeConversations.delete(sender);
};

const isGuidedStartCommand = (message) => {
  const normalized = String(message || '').trim().toUpperCase();
  return normalized === 'START' || normalized === 'REGISTER' || normalized === 'REPORT';
};

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

const normalizeFromWhatsApp = (phone) => {
  const raw = String(phone || '').trim();
  if (!raw) {
    return null;
  }

  if (raw.startsWith('whatsapp:+')) {
    return raw;
  }

  const normalizedTo = normalizePhoneForWhatsApp(raw);
  return normalizedTo;
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
    const sender = String(req.body.From || '').trim();
    const destination = String(req.body.To || '').trim();
    const incomingText = (req.body.Body || '').trim();
    const command = incomingText.toUpperCase();

    // Process only messages targeting the configured WhatsApp number.
    const configuredNumber = String(process.env.TWILIO_WHATSAPP_NUMBER || '').trim();
    if (configuredNumber && destination && configuredNumber !== destination) {
      twiml.message('This bot is not enabled for this number. Please message the configured Saathi WhatsApp number.');
      return res.type('text/xml').status(200).send(twiml.toString());
    }

    if (!incomingText) {
      twiml.message('Please type START to register a problem step-by-step, or send a free-text problem description directly.');
      return res.type('text/xml').status(200).send(twiml.toString());
    }

    if (command === 'HELP') {
      twiml.message(
        [
          'Saathi WhatsApp Bot',
          'Type START to register a new problem in guided mode.',
          'Type RESET to cancel current guided flow.',
          'Or send one free-text message and I will auto-register it using AI.',
        ].join(' ')
      );
      return res.type('text/xml').status(200).send(twiml.toString());
    }

    if (command === 'RESET' || command === 'CANCEL') {
      clearGuidedFlow(sender);
      twiml.message('Your current registration flow was cleared. Type START to begin again.');
      return res.type('text/xml').status(200).send(twiml.toString());
    }

    if (isGuidedStartCommand(incomingText)) {
      startGuidedFlow(sender);
      twiml.message('Let us register your problem. Step 1/4: Please describe the issue in detail.');
      return res.type('text/xml').status(200).send(twiml.toString());
    }

    const guidedFlow = activeConversations.get(sender);
    if (guidedFlow) {
      if (guidedFlow.step === 'description') {
        guidedFlow.data.description = incomingText;
        guidedFlow.step = 'issueType';
        activeConversations.set(sender, guidedFlow);
        twiml.message(`Step 2/4: Enter issue type from: ${ISSUE_TYPES.join(', ')}.`);
        return res.type('text/xml').status(200).send(twiml.toString());
      }

      if (guidedFlow.step === 'issueType') {
        const issueType = await resolveIssueTypeFromUserText(incomingText);
        if (!issueType) {
          twiml.message(
            [
              'I could not confidently detect the issue type from your text.',
              `Please reply with one of: ${ISSUE_TYPES.join(', ')}.`,
              'Example: Health or Food.',
            ].join(' ')
          );
          return res.type('text/xml').status(200).send(twiml.toString());
        }

        guidedFlow.data.issueType = issueType;
        guidedFlow.step = 'urgency';
        activeConversations.set(sender, guidedFlow);
        twiml.message(
          [
            `Step 2/4 accepted. I detected this as: ${issueType}.`,
            'Step 3/4: Enter urgency from 1 to 10 (10 = most urgent).',
          ].join(' ')
        );
        return res.type('text/xml').status(200).send(twiml.toString());
      }

      if (guidedFlow.step === 'urgency') {
        const urgency = parseUrgency(incomingText);
        if (!urgency) {
          twiml.message('Invalid urgency. Please send a number between 1 and 10.');
          return res.type('text/xml').status(200).send(twiml.toString());
        }

        guidedFlow.data.urgency = urgency;
        guidedFlow.step = 'address';
        activeConversations.set(sender, guidedFlow);
        twiml.message('Step 4/4: Please send address/locality (example: Malviya Nagar, New Delhi).');
        return res.type('text/xml').status(200).send(twiml.toString());
      }

      if (guidedFlow.step === 'address') {
        guidedFlow.data.address = incomingText;

        const reportPayload = {
          issueType: guidedFlow.data.issueType,
          urgency: guidedFlow.data.urgency,
          description: guidedFlow.data.description,
          location: {
            type: 'Point',
            coordinates: DEFAULT_COORDINATES,
            address: guidedFlow.data.address,
          },
          isUnstructured: false,
          source: 'whatsapp',
          originalText: guidedFlow.data.description,
          status: 'Pending',
        };

        const report = await localStore.createReport(reportPayload, Report);
        clearGuidedFlow(sender);

        twiml.message(
          [
            'Your problem has been registered successfully.',
            `Report ID: ${report._id}.`,
            'Thank you. Our team will review it shortly.',
          ].join(' ')
        );
        return res.type('text/xml').status(200).send(twiml.toString());
      }
    }

    // Fallback mode: one free-text message is parsed by AI and registered as a report.
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
    const from = normalizeFromWhatsApp(process.env.TWILIO_WHATSAPP_NUMBER);

    if (!from || !process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return res.status(500).json({
        success: false,
        message: 'Twilio environment variables are missing or sender format is invalid. Use TWILIO_WHATSAPP_NUMBER like whatsapp:+14155238886.',
      });
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
      body: message || 'Hello from Saathi.',
    });

    return res.status(200).json({
      success: true,
      message: 'WhatsApp message sent successfully.',
      sid: response.sid,
      to: toWhatsApp,
      status: response.status,
    });
  } catch (error) {
    console.error('Twilio send message error:', error?.message || error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to send WhatsApp message.',
    });
  }
};

exports.getMessageStatus = async (req, res) => {
  try {
    const { sid } = req.params;

    if (!sid) {
      return res.status(400).json({ success: false, message: 'Message SID is required.' });
    }

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return res.status(500).json({ success: false, message: 'Twilio environment variables are missing.' });
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const message = await client.messages(sid).fetch();

    return res.status(200).json({
      success: true,
      sid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      dateSent: message.dateSent,
      dateUpdated: message.dateUpdated,
    });
  } catch (error) {
    console.error('Twilio status fetch error:', error?.message || error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch WhatsApp message status.',
    });
  }
};
