import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bot, X, Send, MessageSquare, Mic, MicOff, Languages } from 'lucide-react';
import { getSession } from '../utils/roleAuth';
import { apiUrl } from '../config/api';

const languageOptions = [
  { code: 'en', speechCode: 'en-IN', label: 'English' },
  { code: 'hi', speechCode: 'hi-IN', label: 'Hindi' },
  { code: 'ta', speechCode: 'ta-IN', label: 'Tamil' },
  { code: 'mr', speechCode: 'mr-IN', label: 'Marathi' },
  { code: 'bn', speechCode: 'bn-IN', label: 'Bengali' },
  { code: 'te', speechCode: 'te-IN', label: 'Telugu' },
  { code: 'kn', speechCode: 'kn-IN', label: 'Kannada' },
  { code: 'ml', speechCode: 'ml-IN', label: 'Malayalam' },
  { code: 'gu', speechCode: 'gu-IN', label: 'Gujarati' },
  { code: 'pa', speechCode: 'pa-IN', label: 'Punjabi' },
];

const ChatbotWidget = ({ defaultRole }) => {
  const session = getSession();
  const role = defaultRole || session?.role || 'citizen';
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello. I can help with reports, volunteer coordination, and app usage.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [listening, setListening] = useState(false);

  const recognitionSupported = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    const handleExternalOpen = (event) => {
      setOpen(true);
      const starter = event?.detail?.starterMessage;
      if (starter) {
        setMessage(starter);
      }
    };

    window.addEventListener('volunteeriq-open-chatbot', handleExternalOpen);
    return () => {
      window.removeEventListener('volunteeriq-open-chatbot', handleExternalOpen);
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionSupported) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    const selected = languageOptions.find((lang) => lang.code === selectedLanguage);
    recognition.lang = selected?.speechCode || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || '';
      if (transcript.trim()) {
        setMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };

    recognition.start();
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setMessage('');
    const nextMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);

    try {
      const response = await axios.post(apiUrl('/api/chatbot/respond'), {
        role,
        language: selectedLanguage,
        message: trimmed,
        history: nextMessages.slice(-6),
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: response.data.message }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: error.response?.data?.message || 'I could not respond right now.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-semibold">VolunteerIQ Chatbot</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-300 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-5 ${item.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}>
                  {item.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-3 py-2 text-sm border border-slate-200 bg-white text-slate-500">
                  Typing...
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-200 bg-white">
            <div className="mb-2 flex items-center gap-2">
              <div className="relative flex-1">
                <Languages className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full rounded-xl border-slate-200 pl-9 pr-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  {languageOptions.map((option) => (
                    <option key={option.code} value={option.code}>{option.label}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={!recognitionSupported || listening}
                className={`inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold ${recognitionSupported ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                title={recognitionSupported ? 'Speak to type' : 'Voice input not supported in this browser'}
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
            <textarea
              rows="2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about reports, volunteers, or how to use the app..."
              className="w-full resize-none rounded-xl border-slate-200 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
            {!recognitionSupported && (
              <p className="mt-1 text-xs text-slate-400">Voice input is not supported in this browser.</p>
            )}
            <button
              onClick={handleSend}
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((current) => !current)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800"
        aria-label="Open chatbot"
      >
        <Bot className="h-6 w-6" />
      </button>
    </div>
  );
};

export default ChatbotWidget;
