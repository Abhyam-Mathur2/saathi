import React, { useEffect, useState } from 'react';
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
  const [citizenCity, setCitizenCity] = useState(session?.city || '');
  const [nearbyOrganizations, setNearbyOrganizations] = useState([]);
  const [trackedReports, setTrackedReports] = useState([]);
  const [lookupLoading, setLookupLoading] = useState(false);

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

  const loadCitizenView = async () => {
    try {
      setLookupLoading(true);
      const [orgResponse, reportResponse] = await Promise.all([
        axios.get(apiUrl('/api/citizens/nearby-organizations'), {
          params: citizenCity ? { city: citizenCity } : {},
        }),
        axios.get(apiUrl('/api/citizens/my-reports'), {
          params: {
            phone: session?.phone || '',
            city: citizenCity || '',
          },
        }),
      ]);

      setNearbyOrganizations(orgResponse.data.data || []);
      setTrackedReports(reportResponse.data.data || []);
    } catch (error) {
      console.error('Citizen lookup failed:', error);
      setNearbyOrganizations([]);
      setTrackedReports([]);
    } finally {
      setLookupLoading(false);
    }
  };

  useEffect(() => {
    loadCitizenView();
  }, []);

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

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">WhatsApp Updates</h2>
          </div>
          
          <p className="text-sm text-slate-700 mb-4 font-medium">Get real-time updates via WhatsApp. Enter your phone number to receive volunteer assignments and status updates.</p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                Your Phone Number
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                <input
                  type="tel"
                  value={whatsAppNumber}
                  onChange={(e) => setWhatsAppNumber(e.target.value)}
                  placeholder="Enter mobile number (e.g., 9876543210)"
                  className="w-full h-12 rounded-xl border-2 border-emerald-300 bg-white pl-12 pr-4 text-slate-900 font-semibold placeholder:text-slate-400 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="mt-2 text-xs text-slate-600">Format: 10-digit Indian number (with or without +91 prefix)</p>
            </div>
            
            <button
              type="button"
              onClick={sendWhatsAppMessage}
              disabled={sendingWhatsApp || !whatsAppNumber.trim()}
              className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              <MessageCircle className="h-5 w-5" />
              {sendingWhatsApp ? 'Sending Message...' : 'Send WhatsApp Message'}
            </button>
            
            <p className="text-xs text-emerald-700 bg-emerald-100 rounded-lg p-2 text-center">
              💬 Tap to open WhatsApp and send your message via Twilio
            </p>
          </div>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Nearby NGOs</h2>
              <p className="text-sm text-slate-600">See NGOs operating in your city only.</p>
            </div>
            <button
              type="button"
              onClick={loadCitizenView}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Refresh
            </button>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={citizenCity}
              onChange={(e) => setCitizenCity(e.target.value)}
              placeholder="Enter your city, e.g. New Delhi"
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2"
            />
            <button
              type="button"
              onClick={loadCitizenView}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Search
            </button>
          </div>

          <div className="space-y-3">
            {lookupLoading ? (
              <p className="text-sm text-slate-500">Loading nearby NGOs...</p>
            ) : nearbyOrganizations.length > 0 ? nearbyOrganizations.map((org) => (
              <div key={org._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{org.name}</p>
                <p className="text-xs text-slate-500">{org.city}, {org.state}</p>
                <p className="mt-1 text-xs text-slate-600">Radius: {org.radiusKm || 25} km</p>
              </div>
            )) : (
              <p className="text-sm text-slate-500">No NGOs found for this city.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Track My Reports</h2>
            <p className="text-sm text-slate-600">View status updates for reports submitted with your phone number.</p>
          </div>

          <div className="space-y-3">
            {trackedReports.length > 0 ? trackedReports.map((report) => (
              <div key={report._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{report.issueType}</p>
                  <span className="rounded-full bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-700">{report.status}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600 line-clamp-2">{report.description}</p>
                <p className="mt-2 text-xs text-slate-500">{report.location?.address || 'Unknown location'}</p>
              </div>
            )) : (
              <p className="text-sm text-slate-500">No tracked reports found for your account.</p>
            )}
          </div>
        </div>
      </div>

      <ReportSubmission />
      <ChatbotWidget defaultRole="citizen" />
    </div>
  );
};

export default CitizenPortal;
