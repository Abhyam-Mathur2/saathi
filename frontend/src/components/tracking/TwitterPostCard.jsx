import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Twitter, Sparkles, RefreshCw, Copy, Check, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { apiUrl } from '../../config/api';

export const shouldShowTwitterCard = (report) => {
  if (!report) return false;
  const daysOpen = Math.floor(
    (Date.now() - new Date(report.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  const govTypes = ['Infrastructure', 'Safety', 'Environment'];
  const isUnresolved = report.status !== 'Resolved';
  const isOldEnough = daysOpen >= 3;
  const isUrgent = report.urgency >= 7;
  const isGovType = govTypes.includes(report.issueType);
  
  return isUnresolved && isGovType && (isOldEnough || isUrgent);
};

export default function TwitterPostCard({ report }) {
  const [tweet, setTweet] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const twitterWindowRef = useRef(null);

  const daysOpen = Math.floor(
    (Date.now() - new Date(report.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const generateTweet = async () => {
    setLoading(true);
    const popup = window.open('', '_blank', 'width=600,height=400,noopener,noreferrer');
    twitterWindowRef.current = popup;
    try {
      const res = await axios.post(apiUrl(`/api/reports/${report._id}/generate-tweet`), {
        report: {
          _id: report._id,
          issueType: report.issueType,
          urgency: report.urgency,
          description: report.description,
          createdAt: report.createdAt,
          address: report.address,
          location: report.location,
          status: report.status,
        }
      });
      if (res.data.success) {
        const generatedTweet = res.data.data.tweet;
        setTweet(generatedTweet);
        setGenerated(true);

        const encodedTweet = encodeURIComponent(generatedTweet);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTweet}`;
        if (twitterWindowRef.current && !twitterWindowRef.current.closed) {
          twitterWindowRef.current.location.href = twitterUrl;
          twitterWindowRef.current.focus();
        } else {
          window.open(twitterUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
        }
      }
    } catch (err) {
      console.error(err);
      if (twitterWindowRef.current && !twitterWindowRef.current.closed) {
        twitterWindowRef.current.close();
      }
    } finally {
      setLoading(false);
    }
  };

  const postOnTwitter = () => {
    const encodedTweet = encodeURIComponent(tweet);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTweet}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  const copyTweet = () => {
    navigator.clipboard.writeText(tweet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTweetPreview = (text) => {
    return text.split(/(@\w+|#\w+)/g).map((part, i) => {
      if (part.startsWith('@') || part.startsWith('#')) {
        return <span key={i} className="text-sky-400">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className={`overflow-hidden transition-all duration-500 rounded-3xl ${
      generated ? 'bg-white shadow-card border border-primary-100 p-6' : 'bg-slate-50 border-2 border-dashed border-slate-200 p-5'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-lg">
             {daysOpen} Days Open
           </span>
           <span className="text-xs font-bold px-2 py-1 bg-slate-200 text-slate-700 rounded-lg">
             {report.issueType} 🚧
           </span>
        </div>
        <Twitter className={generated ? "text-slate-900" : "text-slate-400"} size={20} />
      </div>

      {!generated ? (
        <div className="space-y-4">
          <div>
            <h3 className="font-heading font-bold text-slate-800 text-lg">Still waiting for resolution?</h3>
            <p className="text-slate-500 text-sm font-body mt-1">
              Make your voice heard. Post this on 𝕏 (Twitter) and tag authorities — we'll draft the message for you.
            </p>
          </div>
          <button
            onClick={generateTweet}
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {loading ? 'Generating...' : 'Generate my Tweet'}
          </button>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <h4 className="text-slate-900 font-bold text-sm flex items-center gap-2">
              Ready to post <Sparkles size={14} className="text-primary-500" />
            </h4>
            <span className={`text-[10px] font-bold ${tweet.length > 280 ? 'text-red-500' : tweet.length > 260 ? 'text-amber-500' : 'text-slate-400'}`}>
              {tweet.length}/280 characters
            </span>
          </div>

          <div className="bg-slate-900 rounded-2xl p-4 text-white font-body text-[13px] leading-relaxed shadow-inner">
            {formatTweetPreview(tweet)}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={generateTweet}
              className="flex-1 min-w-[120px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-full text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw size={14} /> Regenerate
            </button>
            <button
              onClick={copyTweet}
              className="flex-1 min-w-[100px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-full text-xs flex items-center justify-center gap-2 transition-colors"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={postOnTwitter}
              className="w-full bg-black hover:bg-slate-800 text-white font-bold py-3 rounded-full text-sm flex items-center justify-center gap-2 transition-all active:scale-95 mt-1"
            >
              Post on 𝕏 <ExternalLink size={16} />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400">
            You'll be taken to 𝕏 to review and post. No app access required.
          </p>
        </motion.div>
      )}
    </div>
  );
}
