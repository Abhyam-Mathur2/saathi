import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, Loader2, Sparkles, LocateFixed, Mic, ChevronLeft, ChevronRight } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { apiUrl } from '../config/api';

export default function ReportSubmission() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const [formData, setFormData] = useState({
    issueType: 'Other',
    reportImage: '',
    address: '',
    lat: null,
    lng: null,
    urgency: 5,
    description: '',
    aiUsed: false
  });

  const ISSUE_TYPES = ['Food', 'Health', 'Education', 'Infrastructure', 'Safety', 'Environment', 'Other'];

  const isLikelyUsefulText = (text) => {
    const t = String(text || '').trim();
    if (!t || t.length < 20) return false;
    const words = t.split(/\s+/);
    if (words.length < 4) return false;
    const alphaChars = (t.match(/[A-Za-z]/g) || []).length;
    const alphaRatio = alphaChars / t.length;
    const weirdChars = (t.match(/[~`^_|\\]/g) || []).length;
    const weirdRatio = weirdChars / t.length;
    return alphaRatio > 0.55 && weirdRatio < 0.08;
  };

  const normalizeIssueType = (value, text = '') => {
    const raw = String(value || '').toLowerCase().trim();
    const combined = `${raw} ${String(text || '').toLowerCase()}`;
    if (combined.includes('education') || combined.includes('school') || combined.includes('student') || combined.includes('classroom')) return 'Education';
    if (combined.includes('infrastructure') || combined.includes('road') || combined.includes('pothole') || combined.includes('bridge') || combined.includes('drain') || combined.includes('waterlogging')) return 'Infrastructure';
    if (combined.includes('health') || combined.includes('medical') || combined.includes('dengue') || combined.includes('hospital') || combined.includes('clinic')) return 'Health';
    if (combined.includes('food') || combined.includes('ration') || combined.includes('hunger') || combined.includes('meal') || combined.includes('kitchen')) return 'Food';
    if (combined.includes('safety') || combined.includes('unsafe') || combined.includes('accident') || combined.includes('evacuation') || combined.includes('crowd')) return 'Safety';
    if (combined.includes('environment') || combined.includes('garbage') || combined.includes('waste') || combined.includes('pollution') || combined.includes('sewage') || combined.includes('tree')) return 'Environment';
    return ISSUE_TYPES.includes(value) ? value : 'Other';
  };

  const nextStep = () => setStep(s => Math.min(3, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  // Speech Recognition
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
    imageReader.onloadend = async () => {
      const base64 = imageReader.result;
      setFormData(prev => ({ ...prev, reportImage: base64 }));
      
      // Analyze with vision + OCR (tolerant relevance filter)
      setAiAnalyzing(true);
      try {
        let ai = {};
        try {
          const aiRes = await fetch(apiUrl('/api/reports/analyze-image'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64 })
          });
          const aiData = await aiRes.json();
          if (aiData?.success) ai = aiData.data || {};
        } catch (err) {
          console.error('Vision analysis failed:', err);
        }

        let ocrText = '';
        const relevanceScore = Number(ai?.relevanceScore ?? 50);
        const aiRelevant = ai?.isRelevant !== false;

        const aiDescription = String(ai?.description || ai?.aiSummary || ai?.relevanceReason || '').trim();
        const looksLikeErrorText = /failed|decommissioned|not supported|error|unavailable|vision ai/i.test(aiDescription);
        const safeAIDescription = looksLikeErrorText ? '' : aiDescription;

        // OCR is used only as fallback when AI doesn't provide a usable summary.
        if (!safeAIDescription) {
          const ocrResult = await Tesseract.recognize(file, 'eng').catch(err => {
            console.error('OCR Failed:', err);
            return { data: { text: '' } };
          });
          const rawOCR = ocrResult?.data?.text?.trim() || '';
          ocrText = isLikelyUsefulText(rawOCR) ? rawOCR : '';
        }

        const finalIsClearlyIrrelevant = !aiRelevant && relevanceScore < 25 && !safeAIDescription && !ocrText;

        if (finalIsClearlyIrrelevant) {
          setFormData(prev => ({ ...prev, reportImage: '' }));
          toast.error('This image looks unrelated to a civic issue. Please upload a clearer issue photo.');
          return;
        }

        if ((!aiRelevant && relevanceScore < 45) || (aiRelevant && relevanceScore < 40)) {
          toast('Image is accepted, but please verify description and category.', { icon: '⚠️' });
        }

        const suggestedType = normalizeIssueType(ai?.issueType, `${ai?.description || ''} ${ai?.aiSummary || ''} ${ocrText}`);
        const suggestedUrgency = Math.min(10, Math.max(1, Number(ai?.urgency || 5)));

        const inferredDescription = suggestedType === 'Other'
          ? safeAIDescription
          : safeAIDescription || `Detected a ${suggestedType.toLowerCase()} issue from the uploaded image.`;

        const newDesc = [inferredDescription, ocrText, formData.description]
          .filter(Boolean)[0] || '';

        setFormData(prev => ({
          ...prev,
          issueType: suggestedType,
          urgency: suggestedUrgency,
          description: newDesc,
          aiUsed: !!ocrText || !!ai?.description || !!ai?.aiSummary
        }));
        
        toast.success('Image analyzed. Category and details auto-filled.');
        // Auto advance to next step if analyzing from step 1
        if (step === 1) nextStep();
        
      } catch (error) {
        console.error('Analysis failed:', error);
        toast.error('Could not process image.');
      } finally {
        setAiAnalyzing(false);
      }
    };
    imageReader.readAsDataURL(file);
  };

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          
          // Simple reverse geocoding mock
          try {
             const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
             const data = await res.json();
             const addr = data.address ? `${data.address.city || data.address.town || ''}, ${data.address.state || ''}`.replace(/^, /, '') : `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`;
             setFormData(prev => ({ ...prev, lat, lng, address: addr }));
             toast.success('Location found!');
          } catch(e) {
             setFormData(prev => ({ ...prev, lat, lng, address: `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}` }));
          }
        },
        () => toast.error('Location access denied')
      );
    }
  };

  const handleSubmit = async () => {
    if (!formData.address) { toast.error('Address is required'); return; }
    if (!formData.description) { toast.error('Description is required'); return; }

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/reports'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueType: formData.issueType,
          urgency: formData.urgency,
          description: formData.description,
          location: {
            address: formData.address,
            coordinates: [formData.lng || 77.1, formData.lat || 28.7]
          },
          reportImage: formData.reportImage
        })
      });
      const data = await res.json();
      
      toast.success('Report submitted successfully! 🙏');
      
      // Store locally for citizen portal
      const reports = JSON.parse(localStorage.getItem('saathi_citizen_reports') || '[]');
      reports.unshift(data.data);
      localStorage.setItem('saathi_citizen_reports', JSON.stringify(reports));
      
      setTimeout(() => navigate('/track'), 1500);
    } catch (e) {
      toast.error('Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 pb-safe">
      <PageHeader title="Report a Need" />
      
      <div className="px-4 py-4 max-w-md mx-auto">
        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mb-6">
          {[1,2,3].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-primary-500' : step > i ? 'w-2 bg-primary-300' : 'w-2 bg-warm-200'}`} />
          ))}
        </div>

        {formData.aiUsed && step === 3 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl flex items-start mb-4 text-sm">
            <Sparkles className="w-5 h-5 mr-2 text-amber-500 shrink-0 mt-0.5" />
            <p><strong>AI filled this from your photo.</strong> Please verify before submitting.</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* STEP 1: Photo & Type */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-slate-800">What's the issue?</h2>
                  <p className="text-slate-500 text-sm mt-1">A photo helps us assess the situation faster.</p>
                </div>

                <label className={`block w-full border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-colors ${formData.reportImage ? 'border-primary-500 bg-primary-50' : 'border-warm-300 hover:bg-warm-100 bg-white'}`}>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  {aiAnalyzing ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-3" />
                      <p className="text-primary-700 font-bold">AI is analyzing...</p>
                    </div>
                  ) : formData.reportImage ? (
                    <div className="flex flex-col items-center">
                      <div className="w-full h-40 rounded-xl overflow-hidden mb-3">
                        <img src={formData.reportImage} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-primary-600 font-bold text-sm">Tap to change photo</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                        <Camera className="w-8 h-8 text-primary-500" />
                      </div>
                      <h3 className="font-bold text-slate-700 mb-1">Take a Photo</h3>
                      <p className="text-xs text-slate-500">or upload from gallery</p>
                    </div>
                  )}
                </label>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-3">Issue Category</label>
                  <select 
                    className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none"
                    value={formData.issueType}
                    onChange={e => setFormData({...formData, issueType: e.target.value})}
                  >
                    {['Food', 'Health', 'Education', 'Infrastructure', 'Safety', 'Environment', 'Other'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 2: Location */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-slate-800">Where is this?</h2>
                  <p className="text-slate-500 text-sm mt-1">Accurate location helps volunteers reach faster.</p>
                </div>

                <div className="bg-slate-100 h-48 rounded-3xl border border-warm-200 overflow-hidden flex items-center justify-center relative">
                  {/* Mock map view */}
                  <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/osm-intl/12/2892/1715.png')] bg-cover bg-center opacity-50 grayscale"></div>
                  <div className="relative z-10 w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center animate-pulse">
                    <MapPin className="w-8 h-8 text-primary-600 drop-shadow-md" />
                  </div>
                </div>

                <Button variant="outline" onClick={handleLocation} className="w-full h-14 bg-white">
                  <LocateFixed className="w-5 h-5 mr-2" /> Use My Location
                </Button>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Address</label>
                  <input 
                    type="text" 
                    className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" 
                    placeholder="E.g., Near City Mall, Sector 4"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Urgency & Review */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-slate-800">Final Details</h2>
                  <p className="text-slate-500 text-sm mt-1">Review and submit your report.</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-slate-800">Urgency Level</label>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${formData.urgency >= 8 ? 'bg-red-100 text-red-600' : formData.urgency >= 5 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                      {formData.urgency}/10
                    </span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    value={formData.urgency}
                    onChange={e => setFormData({...formData, urgency: Number(e.target.value)})}
                    className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Low</span>
                    <span>Critical</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-slate-800">Description</label>
                    <button 
                      type="button"
                      onClick={toggleListening}
                      className="p-1.5 rounded-full hover:bg-warm-200 text-primary-600 transition-colors relative"
                    >
                      {isListening ? (
                         <span className="flex h-5 w-5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <Mic className="relative inline-flex rounded-full h-5 w-5 text-red-500" />
                        </span>
                      ) : <Mic className="w-5 h-5" />}
                    </button>
                  </div>
                  <textarea 
                    className="w-full bg-white border border-warm-200 rounded-xl p-4 focus:ring-2 focus:ring-primary-500 outline-none resize-none h-32"
                    placeholder="Describe the situation..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                
                {/* Summary Card */}
                <div className="bg-white rounded-2xl p-4 border border-warm-200 shadow-sm flex items-center">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 mr-3">
                    {formData.reportImage ? (
                      <img src={formData.reportImage} alt="thumb" className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full bg-warm-100 flex items-center justify-center"><Camera className="w-5 h-5 text-warm-400" /></div>}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-sm text-slate-800 truncate">{formData.issueType} Issue</h4>
                    <p className="text-xs text-slate-500 truncate">{formData.address || 'No location'}</p>
                  </div>
                </div>

              </div>
            )}

          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-between">
          {step > 1 ? (
            <Button variant="ghost" onClick={prevStep} className="px-4">
              <ChevronLeft className="w-5 h-5 mr-1" /> Back
            </Button>
          ) : <div></div>}
          
          {step < 3 ? (
            <Button onClick={nextStep} className="px-8 shadow-md" disabled={aiAnalyzing}>
              Next <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} isLoading={loading} className="px-8 shadow-md">
              Submit Report
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}