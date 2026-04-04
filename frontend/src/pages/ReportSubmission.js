import React, { useState } from 'react';
import axios from 'axios';
import { Mic, MicOff, Upload, Send, FileText, Loader2, MapPin, Smartphone, X, LocateFixed } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { toast, Toaster } from 'react-hot-toast';
import ChatbotWidget from '../components/ChatbotWidget';
import { apiUrl } from '../config/api';

const ReportSubmission = () => {
  const [activeTab, setActiveTab] = useState('form'); // 'form' or 'whatsapp'
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [selectedImageName, setSelectedImageName] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    description: '',
    issueType: 'Food',
    urgency: 5,
    address: '',
    longitude: 77.1025,
    latitude: 28.7041,
    reportImage: ''
  });

  // WhatsApp Simulation State
  const [whatsappText, setWhatsappText] = useState('');
  const [aiResponsePreview, setAiResponsePreview] = useState('');

  // Web Speech API Setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFormData({ ...formData, description: formData.description + ' ' + transcript });
      setIsListening(false);
      toast.success('Speech captured!');
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  }

  const toggleListening = () => {
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
      toast('Listening...', { icon: '🎤' });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB.');
      return;
    }

    const imageReader = new FileReader();
    imageReader.onloadend = () => {
      setFormData((prev) => ({ ...prev, reportImage: imageReader.result }));
    };
    imageReader.readAsDataURL(file);
    setSelectedImageName(file.name);

    setOcrLoading(true);
    toast.loading('Extracting text from image...');
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      setFormData((prev) => ({
        ...prev,
        description: text?.trim() ? text : prev.description,
      }));
      toast.dismiss();
      toast.success('Image attached and text extracted.');
    } catch (error) {
      console.error(error);
      toast.error('OCR failed. Please try again.');
    } finally {
      setOcrLoading(false);
    }
  };

  const removeAttachedImage = () => {
    setFormData((prev) => ({ ...prev, reportImage: '' }));
    setSelectedImageName('');
  };

  const fetchBrowserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported in this browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        let resolvedAddress = '';

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                Accept: 'application/json',
              },
            }
          );

          if (res.ok) {
            const data = await res.json();
            const a = data.address || {};
            const city = a.city || a.town || a.village || a.hamlet || a.county || '';
            const state = a.state || '';
            const country = a.country || '';
            resolvedAddress = [city, state, country].filter(Boolean).join(', ');
          }
        } catch (error) {
          // Fall back to coordinates when reverse lookup is unavailable.
        }

        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
          address: resolvedAddress || `Lat ${latitude.toFixed(6)}, Lng ${longitude.toFixed(6)}`,
        }));
        setLocationAccuracy(Math.round(accuracy));
        setLocating(false);
        toast.success('Current location fetched from browser.');
      },
      () => {
        setLocating(false);
        toast.error('Unable to fetch location. Please allow location permission.');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.description.trim()) {
      toast.error('Description is required.');
      return;
    }
    if (!formData.address || !formData.address.trim()) {
      toast.error('Address is required.');
      return;
    }
    if (ocrLoading) {
      toast.error('Please wait for image processing to complete.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        location: {
          coordinates: [formData.longitude, formData.latitude],
          address: formData.address
        }
      };
      await axios.post(apiUrl('/api/reports'), payload);
      toast.success('Report submitted successfully!');
      setFormData({ description: '', issueType: 'Food', urgency: 5, address: '', longitude: 77.1025, latitude: 28.7041, reportImage: '' });
      setSelectedImageName('');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Submission failed.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsappSubmit = async () => {
    if (!whatsappText) return;
    setLoading(true);
    try {
      const response = await axios.post(apiUrl('/api/reports'), {
        isUnstructured: true,
        text: whatsappText
      });
      setAiResponsePreview(response.data.aiResponse || 'AI processed your message successfully.');
      toast.success('WhatsApp message parsed and saved!');
      setWhatsappText('');
    } catch (error) {
      toast.error('Failed to parse message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Toaster position="top-right" />
      
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Report Community Need</h1>
        <p className="text-slate-500 mt-2">Collect data through various input methods for quick response.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'form' ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FileText className="w-4 h-4" /> Standard Form
          </button>
          <button 
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'whatsapp' ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Smartphone className="w-4 h-4" /> WhatsApp/Unstructured
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Issue Type</label>
                  <select 
                    value={formData.issueType}
                    onChange={(e) => setFormData({...formData, issueType: e.target.value})}
                    className="w-full rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {['Food', 'Health', 'Education', 'Infrastructure', 'Safety', 'Environment', 'Other'].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Urgency Level (1-10)</label>
                  <input 
                    type="range" min="1" max="10" 
                    value={formData.urgency}
                    onChange={(e) => setFormData({...formData, urgency: parseInt(e.target.value)})}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 px-1">
                    <span>Low</span>
                    <span className="font-bold text-primary-600">{formData.urgency}</span>
                    <span>Critical</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Address / Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Enter address..."
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full pl-10 rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <button
                    type="button"
                    onClick={fetchBrowserLocation}
                    disabled={locating}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 w-fit"
                  >
                    <LocateFixed className="w-4 h-4" />
                    {locating ? 'Fetching location...' : 'Use My Current Location'}
                  </button>
                  <p className="text-xs text-slate-500">
                    Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    {locationAccuracy ? ` (${locationAccuracy}m accuracy)` : ''}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">Description</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={toggleListening}
                      className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      title="Voice Input"
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <label className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors" title="OCR Upload">
                      <Upload className="w-4 h-4" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>
                <textarea 
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the community need in detail..."
                  className="w-full rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
                ></textarea>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Upload Photo</p>
                      <p className="text-xs text-slate-500">Attach an image of the issue (max 2MB). OCR will auto-extract text.</p>
                    </div>
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer w-fit">
                      <Upload className="w-4 h-4" /> Choose Image
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                  </div>
                  {selectedImageName && (
                    <p className="text-xs text-slate-600 mt-2">Selected: {selectedImageName}</p>
                  )}
                </div>

                {formData.reportImage && (
                  <div className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Attached Image</p>
                      <button
                        type="button"
                        onClick={removeAttachedImage}
                        className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                    <img src={formData.reportImage} alt="Attached report" className="h-40 w-full object-cover rounded-md" />
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading || ocrLoading}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-100"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Submit Report
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3">
                <Smartphone className="w-6 h-6 text-emerald-600 shrink-0" />
                <p className="text-sm text-emerald-800">
                  Paste any unstructured message (like from WhatsApp or SMS) here. 
                  Our AI will automatically extract the location, issue type, and urgency.
                </p>
              </div>
              <textarea 
                rows="8"
                value={whatsappText}
                onChange={(e) => setWhatsappText(e.target.value)}
                placeholder="Example: Urgent health emergency in Malviya Nagar, New Delhi. A child has high fever and needs medical attention immediately."
                className="w-full rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 p-4"
              ></textarea>
              <button 
                onClick={handleWhatsappSubmit}
                disabled={loading || !whatsappText}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-100"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Process with AI
              </button>

              {aiResponsePreview && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">AI Response</p>
                  <p className="text-sm text-emerald-900">{aiResponsePreview}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <ChatbotWidget defaultRole="citizen" />
    </div>
  );
};

export default ReportSubmission;
