import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Mic, Sparkles } from 'lucide-react';
import { apiUrl } from '../config/api';
import { getSession } from '../utils/roleAuth';
import { getActiveRole } from '../utils/roleSwitch';

export default function ChatbotWidget({ defaultRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Namaste! How can Saathi assist you today?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const messagesEndRef = useRef(null);
  
  const session = getSession();
  const currentRole = getActiveRole(session) || defaultRole || 'citizen';

  const quickReplies = {
    citizen: ['Report issue', 'Track report', 'Emergency help', 'Upcoming events'],
    volunteer: ['My active tasks', 'Find nearby needs', 'How to mark complete'],
    admin: ['Show stats', 'Run planner', 'Assign volunteers']
  };

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-chatbot', handleOpen);
    return () => window.removeEventListener('open-chatbot', handleOpen);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(apiUrl('/api/chatbot/respond'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-5),
          role: currentRole,
          language
        })
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.message || 'Sorry, I encountered an error.' }]);
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: 'Network error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-[5.5rem] md:bottom-6 right-4 md:right-6 z-50 w-14 h-14 bg-primary-600 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center hover:bg-primary-700 transition-colors group pb-safe"
          >
            <span className="absolute inset-0 rounded-full border-2 border-primary-400 animate-ping opacity-75"></span>
            <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform relative z-10" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-[5.5rem] md:bottom-6 right-4 md:right-8 z-50 w-[calc(100vw-2rem)] md:w-96 bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-warm-200 pb-safe"
            style={{ height: 'min(600px, calc(100vh - 6rem))' }}
          >
            {/* Header */}
            <div className="bg-primary-600 text-white p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">🤖</div>
                <div>
                  <h3 className="font-bold font-heading leading-tight">Saathi AI</h3>
                  <p className="text-[10px] text-primary-200">Online • {currentRole} assist</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select 
                  className="bg-primary-700 text-xs text-white border-0 rounded px-2 py-1 outline-none"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="en">EN</option>
                  <option value="hi">HI</option>
                </select>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-primary-700 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-warm-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-white border border-warm-200 text-slate-800 rounded-bl-sm shadow-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-warm-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-warm-100">
              <div className="flex overflow-x-auto space-x-2 pb-2 mb-2 hide-scrollbar">
                {quickReplies[currentRole]?.map(qr => (
                  <button 
                    key={qr} 
                    onClick={() => handleSend(qr)}
                    className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-bold rounded-full whitespace-nowrap transition-colors"
                  >
                    {qr}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2 relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Saathi..."
                  className="flex-1 bg-warm-100 border-0 rounded-full pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button className="absolute right-14 text-slate-400 hover:text-primary-600 p-1">
                  <Mic className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-primary-700 transition-colors"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}