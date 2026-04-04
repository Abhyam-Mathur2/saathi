const groqService = require('../services/groqService');

exports.respond = async (req, res) => {
  try {
    const { message, role = 'citizen', language = 'en', history = [] } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const chatMessages = [
      ...Array.isArray(history)
        ? history
            .filter((item) => item && item.role && item.content)
            .map((item) => ({ role: item.role, content: item.content }))
        : [],
      { role: 'user', content: String(message).trim() },
    ];

    const reply = await groqService.chatWithAssistant(chatMessages, role, language);

    return res.status(200).json({
      success: true,
      message: reply,
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate chatbot response.',
    });
  }
};
