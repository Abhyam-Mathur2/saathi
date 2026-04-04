import React, { useState } from 'react';
import axios from 'axios';
import { Bot, FileText, LocateFixed, MessageCircle, Phone, HeartHandshake, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReportSubmission from './ReportSubmission';
import ChatbotWidget from '../components/ChatbotWidget';
import { getSession } from '../utils/roleAuth';
import { apiUrl } from '../config/api';
import { useNavigate } from 'react-router-dom';

const normalizeIndianWhatsAppNumber = (value) => {
  let digits = String(value || '').replace(/\D/g, '');
  if (!digits) {
    return null;
  }

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  if (digits.startsWith('091')) {
    digits = `91${digits.slice(3)}`;
  }

  if (digits.length === 11 && digits.startsWith('0')) {
    digits = `91${digits.slice(1)}`;
  }

  if (digits.length === 10) {
    digits = `91${digits}`;
  }

  if (!digits.startsWith('91') || digits.length !== 12) {
    return null;
  }

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
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Citizen workspace</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Report issues and ask the chatbot</h1>
        <p className="mt-2 text-slate-600">Citizens can submit community needs, capture location from the browser, and get AI help.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary-50 p-3 text-primary-600">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Report a Need</h2>
          </div>
          <p className="mt-3 text-sm text-slate-600">Use the form below to submit a community issue with photo and precise browser location.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <Bot className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Ask the chatbot</h2>
          </div>
          <p className="mt-3 text-sm text-slate-600">Ask how to report, what happens next, or what category to choose.</p>
          <button
            type="button"
            onClick={openChatbot}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Bot className="h-4 w-4" /> Open Chatbot
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
              <LocateFixed className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Browser location</h2>
          </div>
          <p className="mt-3 text-sm text-slate-600">The app can fetch city/locality from your browser location when you allow permission.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">WhatsApp updates</h2>
          </div>
          <p className="mt-3 text-sm text-slate-600">Tap once to open WhatsApp chat and send via Twilio.</p>
          <div className="mt-3 relative">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="tel"
              value={whatsAppNumber}
              onChange={(e) => setWhatsAppNumber(e.target.value)}
              placeholder="+919876543210 or 9876543210"
              className="w-full pl-10 rounded-lg border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={sendWhatsAppMessage}
            disabled={sendingWhatsApp}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            <MessageCircle className="h-4 w-4" />
            {sendingWhatsApp ? 'Sending...' : 'Send WhatsApp'}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary-50 p-3 text-primary-600">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Become a Volunteer</h2>
          </div>
          <p className="mt-3 text-sm text-slate-600">If you want to help others too, create a volunteer profile from here and join the help network.</p>
          <button
            type="button"
            onClick={becomeVolunteer}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Join as Volunteer <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ReportSubmission />
      <ChatbotWidget defaultRole="citizen" />
    </div>
  );
};

export default CitizenPortal;
