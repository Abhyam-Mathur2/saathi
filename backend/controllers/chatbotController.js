const groqService = require('../services/groqService');
const Event = require('../models/Event');
const Assignment = require('../models/Assignment');
const Report = require('../models/Report');

exports.respond = async (req, res) => {
  try {
    const { message, role = 'citizen', language = 'en', history = [], city, orgId, userId } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    // Build Live Database Context to prevent AI hallucination
    let contextStr = '';

    // 1. Fetch Events Context
    try {
        let eventQuery = { status: 'Upcoming' };
        if (role === 'volunteer') eventQuery.targetAudience = { $in: ['volunteers', 'both'] };
        if (role === 'citizen') eventQuery.targetAudience = { $in: ['citizens', 'both'] };
        
        const events = await Event.find(eventQuery).lean();
        if (events.length > 0) {
            contextStr += `UPCOMING LOCAL EVENTS:\n`;
            events.forEach(e => {
                contextStr += `- Event: "${e.title}" (${e.eventType}). Date: ${new Date(e.date).toLocaleDateString()}, Location: ${e.location?.address || 'Local site'}. Desc: ${e.description}\n`;
            });
        }
    } catch(err) { console.error(err); }

    // 2. Fetch Scope Context
    try {
        if (role === 'volunteer' && userId && userId !== 'undefined') {
            const activeTasks = await Assignment.find({ volunteer: userId, status: { $in: ['Pending', 'Accepted', 'In Progress'] }})
                .populate('report').lean();
            if (activeTasks.length > 0) {
                contextStr += `VOLUNTEER'S ASSIGNED TASKS:\n`;
                activeTasks.forEach(a => {
                    if(a.report) contextStr += `- Duty: ${a.report.issueType} at ${a.report.location?.address || 'Unknown'}. Urgency: ${a.report.urgency}/10. Task: ${a.report.description}\n`;
                });
            } else {
                contextStr += `Note: The volunteer has NO active assignments right now.\n`;
            }
        } else if (role === 'admin' && orgId && orgId !== 'undefined') {
            const pending = await Report.countDocuments({ organization: orgId, status: 'Pending' });
            contextStr += `ADMIN DASHBOARD SUMMARY:\n- Pending unassigned community reports needing attention: ${pending}\n`;
        }
    } catch(err) { console.error(err); }

    const chatMessages = [
      ...Array.isArray(history)
        ? history
            .filter((item) => item && item.role && item.content)
            .map((item) => ({ role: item.role, content: item.content }))
        : [],
      { role: 'user', content: String(message).trim() },
    ];

    const reply = await groqService.chatWithAssistant(chatMessages, role, language, contextStr);

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
