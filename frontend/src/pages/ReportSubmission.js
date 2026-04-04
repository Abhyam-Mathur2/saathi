import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mic, MicOff, Upload, Send, FileText, Loader2, MapPin, Smartphone } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { toast, Toaster } from 'react-hot-toast';

const ReportSubmission = () => {
  const [activeTab, setActiveTab] = useState('form'); // 'form' or 'whatsapp'
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    description: '',
    issueType: 'Food',
    urgency: 5,
    address: '',
    longitude: 77.1025,
    latitude: 28.7041
  });

  // WhatsApp Simulation State
  const [whatsappText, setWhatsappText] = useState('');

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

    setOcrLoading(true);
    toast.loading('Extracting text from image...');
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      setFormData({ ...formData, description: text });
      toast.dismiss();
      toast.success('Text extracted successfully!');
    } catch (error) {
      console.error(error);
      toast.error('OCR failed. Please try again.');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        location: {
          coordinates: [formData.longitude, formData.latitude],
          address: formData.address
        }
      };
      await axios.post('http://localhost:5000/api/reports', payload);
      toast.success('Report submitted successfully!');
      setFormData({ description: '', issueType: 'Food', urgency: 5, address: '', longitude: 77.1025, latitude: 28.7041 });
    } catch (error) {
      toast.error('Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsappSubmit = async () => {
    if (!whatsappText) return;
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/reports', {
        isUnstructured: true,
        text: whatsappText
      });
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportSubmission;
