import React, { useState } from 'react';
import axios from 'axios';
import { Bot, FileText, LocateFixed, MessageCircle, Phone, HeartHandshake, ArrowRight, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReportSubmission from './ReportSubmission';
import ChatbotWidget from '../components/ChatbotWidget';
import RoleToggle from '../components/RoleToggle';
import { getSession } from '../utils/roleAuth';
import { apiUrl } from '../config/api';
import { useNavigate } from 'react-router-dom';

const normalizeIndianWhatsAppNumber = (value) => {
  let digits = String(value || '').replace(/\D/g, '');
  if (!digits) {
    return null;
  }
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('091')) digits = `91${digits.slice(3)}`;
  if (digits.length === 11 && digits.startsWith('0')) digits = `91${digits.slice(1)}`;
  if (digits.length === 10) digits = `91${digits}`;
  if (!digits.startsWith('91') || digits.length !== 12) return null;
  return `+${digits}`;
};

const CitizenPortal = () => {
  const session = getSession();
  const navigate = useNavigate();
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState(session?.phone || '');

  const openChatbot = () => {
    window.dispatchEvent(
      new CustomEvent('saathi-open-chatbot', {
        detail: { starterMessage: 'Help me report an issue in my area.' },
      })
    );
  };

  const becomeVolunteer = () => {
    window.dispatchEvent(
      new CustomEvent('saathi-open-chatbot', {
        detail: {
          starterMessage: 'I want to become a volunteer. Please tell me how to register and what details I need.',
        },
      })
    );
    navigate('/register');
  };

  const sendWhatsAppMessage = async () => {
    const toPhone = String(whatsAppNumber || '').trim();

    if (!toPhone) {
      toast.error('Please enter a WhatsApp number to test.');
      return;
    }

    const normalizedTo = normalizeIndianWhatsAppNumber(toPhone);
    if (!normalizedTo) {
      toast.error('Enter a valid Indian mobile number, e.g. +919876543210 or 9876543210.');
      return;
    }

    const messageText = `Hi ${session?.name || 'Citizen'}, your Saathi workspace is active. You can submit reports and track assistance updates here.`;
    const waNumber = normalizedTo.replace('+', '');
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(messageText)}`;

    const chatWindow = window.open(waUrl, '_blank', 'noopener,noreferrer');
    if (!chatWindow) {
      toast.error('Popup blocked. Please allow popups to open WhatsApp.');
    }

    try {
      setSendingWhatsApp(true);
      const response = await axios.post(apiUrl('/api/whatsapp/send'), {
        to: normalizedTo,
        message: messageText,
      });

      const sid = response.data?.sid;
      toast.success(sid ? `WhatsApp sent (Twilio SID: ${sid}).` : 'WhatsApp message sent successfully.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Twilio send failed. You can still send manually in opened WhatsApp chat.');
    } finally {
      setSendingWhatsApp(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-10">
      <RoleToggle session={session} />
      
      {/* Header Section */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-primary-600 mb-2">Citizen Workspace</p>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">Report issues and ask the chatbot</h1>
          <p className="mt-2 text-slate-600 max-w-2xl text-lg">Citizens can submit community needs, capture location from the browser, and get AI help.</p>
        </div>
        <button
          onClick={() => navigate('/emergency')}
          className="flex-shrink-0 animate-pulse-slow inline-flex items-center gap-2 bg-rose-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 transition-colors"
        >
          <ShieldAlert className="w-5 h-5" />
          Emergency Alert
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left main grid (Takes 2/3 width on large screens) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-primary-100 bg-gradient-to-b from-primary-50 to-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="rounded-2xl bg-white shadow-sm border border-primary-100 p-3 text-primary-600">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Report a Need</h2>
            </div>
            <p className="text-slate-600">Use the form below to submit a community issue with photo and precise browser location.</p>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-b from-emerald-50 to-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="rounded-2xl bg-white shadow-sm border border-emerald-100 p-3 text-emerald-600">
                <Bot className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Ask the chatbot</h2>
            </div>
            <p className="text-slate-600 mb-5">Ask how to report, what happens next, or what category to choose.</p>
            <button
              type="button"
              onClick={openChatbot}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-colors cursor-pointer"
            >
              <Bot className="h-5 w-5" /> Open Chatbot
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 text-slate-700">
                <LocateFixed className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Browser location</h2>
            </div>
            <p className="text-slate-600">The app can fetch city/locality from your browser location when you allow permission.</p>
          </div>

          <div className="rounded-3xl border border-accent-100 bg-gradient-to-b from-accent-50 to-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="rounded-2xl bg-white border border-accent-100 shadow-sm p-3 text-accent-600">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Become a Volunteer</h2>
            </div>
            <p className="text-slate-600 flex-1">If you want to help others too, create a volunteer profile from here and join the help network.</p>
            <button
              type="button"
              onClick={becomeVolunteer}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-4 py-3 text-sm font-bold text-white hover:bg-accent-700 shadow-md shadow-accent-200 transition-colors"
            >
              Join as Volunteer <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Right side panel (Takes 1/3 width) */}
        <div className="lg:col-span-1 border border-emerald-200 bg-gradient-to-b from-emerald-100/50 to-emerald-50 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-5">
            <div className="rounded-2xl bg-white border border-emerald-200 shadow-sm p-3 text-emerald-600">
              <MessageCircle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">WhatsApp Updates</h2>
          </div>
          
          <p className="text-slate-700 mb-6 font-medium leading-relaxed">
            Get real-time updates via WhatsApp. Enter your phone number to receive volunteer assignments and status updates.
          </p>
          
          <div className="space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-emerald-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Your Phone Number
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                <input
                  type="tel"
                  value={whatsAppNumber}
                  onChange={(e) => setWhatsAppNumber(e.target.value)}
                  placeholder="(e.g., 9876543210)"
                  className="w-full h-12 rounded-xl border border-emerald-200 bg-emerald-50/30 pl-11 pr-4 text-slate-900 font-bold placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none"
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Format: 10-digit Indian number (with or without +91 prefix)</p>
            </div>
            
            <button
              type="button"
              onClick={sendWhatsAppMessage}
              disabled={sendingWhatsApp || !whatsAppNumber.trim()}
              className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 font-bold text-white hover:bg-[#1DA851] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-[#25D366]/30"
            >
              <MessageCircle className="h-5 w-5" />
              {sendingWhatsApp ? 'Sending Message...' : 'Send WhatsApp Message'}
            </button>
            
            <div className="bg-emerald-50 text-emerald-800 text-xs font-medium p-3 rounded-xl border border-emerald-100 flex gap-2 items-start">
              <span className="text-base leading-none mt-0.5">💬</span>
              <span>Tap to open WhatsApp and send your message via Twilio</span>
            </div>
          </div>
        </div>

      </div>

      <ReportSubmission />
      <ChatbotWidget defaultRole="citizen" />
    </div>
  );
};

export default CitizenPortal;
