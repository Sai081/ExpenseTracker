import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Check, 
  X, 
  Loader2, 
  Sparkles, 
  AlertCircle,
  Calendar,
  CreditCard,
  Zap
} from 'lucide-react';
import { api } from '../lib/api';
import { useCurrency, CURRENCY_ALIASES } from '../context/CurrencyContext';

const DEFAULT_CATEGORIES = [
  "Food & Dining",
  "Household Groceries",
  "Transportation",
  "Housing & Rent",
  "Utilities & Bills",
  "Entertainment & Leisure",
  "Healthcare & Fitness",
  "Shopping & Cloud",
  "Professional Yield",
  "Salary",
  "Investments & Retained Alpha",
  "Miscellaneous"
];

export function VoiceModal({ isOpen, onClose, onTransactionCreated }) {
  const { currency, convertAmount } = useCurrency();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [audioStatus, setAudioStatus] = useState('');
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);
  
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const isListeningRef = useRef(false);
  const latestTranscriptRef = useRef('');

  // Keep refs synced
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    latestTranscriptRef.current = transcript;
  }, [transcript]);

  const stopAllRecording = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    isListeningRef.current = false;
    setIsListening(false);
    setAudioStatus('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopAllRecording();
      setTranscript('');
      setParsedData(null);
      setError('');
      return;
    }

    // Fetch live categories list
    api.getCategories().then((cats) => {
      if (Array.isArray(cats) && cats.length > 0) {
        setCategoriesList(cats.map(c => c.name));
      }
    }).catch(() => {});

    // Setup speech recognition instance without auto-starting immediately
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setError('');
        setAudioStatus('Listening... Speak your expense naturally');
      };

      recognition.onresult = (event) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        if (current.trim()) {
          setTranscript(current.trim());
          setAudioStatus('Listening to voice stream...');

          // Reset silence timer: only after user has spoken, wait 2.5s of silence to auto-parse
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          silenceTimerRef.current = setTimeout(() => {
            if (isListeningRef.current) {
              stopAllRecording();
              triggerParse(current.trim());
            }
          }, 2500);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition warning:', event.error);
        if (event.error === 'no-speech') {
          // Do NOT stop on initial silence! Keep waiting for the user to speak
          setAudioStatus('Waiting for your voice... Speak anytime');
          return;
        }
        if (event.error === 'not-allowed') {
          setError('Microphone permission was denied. Please allow microphone access.');
          stopAllRecording();
          return;
        }
        // Other errors: try MediaRecorder fallback
        startMediaRecorderFallback();
      };

      recognition.onend = () => {
        // If the user intended to keep listening and didn't manually stop, auto-restart
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // If already started or failed, don't crash
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      stopAllRecording();
    };
  }, [isOpen]);

  const startMediaRecorderFallback = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is unavailable.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());

        if (audioBlob.size > 1000) {
          setAudioStatus('Transcribing with Groq Whisper v3...');
          try {
            const text = await api.transcribeAudio(audioBlob);
            if (text) {
              setTranscript(text);
              triggerParse(text);
            }
          } catch (err) {
            setError(err.message || 'Audio transcription failed. Ensure Groq API key is set.');
          } finally {
            setAudioStatus('');
          }
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      isListeningRef.current = true;
      setIsListening(true);
      setAudioStatus('Recording audio stream (Groq Whisper v3)...');
    } catch (err) {
      setError('Microphone permission required for voice entry.');
      stopAllRecording();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      // User tapped stop: stop recording and trigger parse if transcript exists
      const currentText = latestTranscriptRef.current;
      stopAllRecording();
      if (currentText && currentText.trim()) {
        triggerParse(currentText.trim());
      } else {
        setAudioStatus('Recording stopped.');
      }
    } else {
      // User tapped start: reset and begin listening
      setTranscript('');
      setParsedData(null);
      setError('');
      isListeningRef.current = true;
      setIsListening(true);
      setAudioStatus('Listening... Speak now');

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          return;
        } catch (e) {
          console.warn('Recognition start failed, falling back to MediaRecorder:', e);
        }
      }
      startMediaRecorderFallback();
    }
  };

  const triggerParse = async (textToParse) => {
    const query = (textToParse || transcript || latestTranscriptRef.current).trim();
    if (!query) return;
    setParsing(true);
    setError('');
    try {
      let data;
      try {
        data = await api.parseVoice(query);
      } catch (err) {
        // Client fallback currency detection & conversion
        const textLower = query.toLowerCase();
        let detectedCurr = null;
        let amt = 0;
        for (const [alias, code] of Object.entries(CURRENCY_ALIASES)) {
          const match = textLower.match(new RegExp(`(?:${alias}\\s*(\\d+(?:,\\d+)*(?:\\.\\d{1,2})?)|(\\d+(?:,\\d+)*(?:\\.\\d{1,2})?)\\s*${alias})`));
          if (match) {
            const numStr = match[1] || match[2];
            amt = parseFloat(numStr.replace(/,/g, ''));
            detectedCurr = code;
            break;
          }
        }
        if (!amt) {
          const numMatch = textLower.match(/(\d+(?:,\d+)*(?:\.\d{1,2})?)/);
          if (numMatch) amt = parseFloat(numMatch[1].replace(/,/g, ''));
        }
        let note = query;
        if (detectedCurr && detectedCurr !== currency.code) {
          const converted = convertAmount(amt, detectedCurr, currency.code);
          note += ` (converted from ${amt} ${detectedCurr})`;
          amt = converted;
        }
        data = {
          amount: amt || 100,
          type: textLower.includes('salary') || textLower.includes('earned') ? 'income' : 'expense',
          category: 'Food & Dining',
          description: note,
          payment_method: 'upi',
          date: new Date().toISOString().split('T')[0]
        };
      }

      setParsedData({
        amount: data.amount || '',
        type: data.type || 'expense',
        category: data.category || 'Food & Dining',
        category_id: data.category_id || null,
        description: data.description || query,
        payment_method: data.payment_method || 'upi',
        date: data.date || new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      setError(err.message || 'Failed to extract transaction from voice.');
    } finally {
      setParsing(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setParsedData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!parsedData) return;
    if (!parsedData.amount || Number(parsedData.amount) <= 0) {
      setError('Please enter a valid quantum amount.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await api.createTransaction({
        type: parsedData.type || 'expense',
        amount: parseFloat(parsedData.amount),
        category_id: parsedData.category_id || null,
        description: parsedData.description || 'Voice ledger entry',
        date: parsedData.date || new Date().toISOString().split('T')[0],
        payment_method: parsedData.payment_method || 'upi'
      });
      if (onTransactionCreated) {
        onTransactionCreated();
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save transaction to ledger.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const waveBars = [8, 16, 26, 14, 32, 20, 10, 24, 34, 14, 22, 28, 16, 10];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in font-['Space_Grotesk',sans-serif]">
      <div className="relative w-full max-w-lg p-6 sm:p-7 apple-glass-card rounded-3xl shadow-2xl border border-violet-500/30 text-white overflow-hidden">
        {/* Ambient backdrop glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div
            className={`absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-[100px] transition-colors duration-500 ${
              isListening ? 'bg-rose-500/25' : 'bg-violet-500/25'
            }`}
          />
          <div className="absolute inset-0 bg-grid opacity-25" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.08] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/30">
            <Mic className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Syne',sans-serif]">Acoustic Ledger Entry</h3>
            <p className="text-xs text-slate-400 font-mono">Whisper v3 & Groq LLaMA 3.1 &lt; 140ms</p>
          </div>
        </div>

        {/* Mic Pulse Button */}
        <div className="flex flex-col items-center justify-center py-4">
          <button
            onClick={toggleListening}
            className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 shadow-2xl cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white shadow-rose-500/40 scale-110'
                : 'bg-gradient-to-tr from-violet-600 via-purple-600 to-fuchsia-600 hover:scale-105 text-white shadow-violet-600/40'
            }`}
          >
            {isListening && (
              <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-75" />
            )}
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>

          {/* Equalizer Waveform */}
          <div className="flex items-end gap-1 h-6 mt-4" aria-hidden="true">
            {waveBars.map((h, i) => (
              <span
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-violet-600 to-cyan-400"
                style={{
                  height: `${h}px`,
                  transformOrigin: 'bottom',
                  transform: isListening ? undefined : 'scaleY(0.25)',
                  opacity: isListening ? 1 : 0.35,
                  animation: isListening
                    ? `soundWaveAlways ${0.5 + (i % 4) * 0.12}s ease-in-out ${i * 0.05}s infinite alternate`
                    : 'none',
                  transition: 'opacity 0.3s ease, transform 0.3s ease'
                }}
              />
            ))}
          </div>

          <p className="mt-3 text-xs sm:text-sm font-semibold text-slate-200 font-mono text-center">
            {audioStatus || (isListening ? 'Listening... Speak naturally' : transcript ? 'Tap mic to re-record' : 'Tap mic to start speaking')}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 text-center font-mono">
            e.g. "Spent 450 rupees for lunch with team via UPI"
          </p>
        </div>

        {/* Live Audio Transcript */}
        {transcript && (
          <div className="p-3.5 mb-4 rounded-2xl bg-black/50 border border-white/5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-400 block mb-1">
              Raw Stream Transcript:
            </span>
            <p className="text-slate-200 text-xs italic font-medium">"{transcript}"</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Fully Editable Parsed Data Form */}
        {parsedData && (
          <div className="p-5 mb-4 rounded-2xl bg-white/[0.03] border border-violet-500/30 space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-violet-300">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>Extracted Schema Review</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Editable before commit</span>
            </div>

            {/* Type Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 w-24">Type:</span>
              <div className="flex items-center p-1 bg-black/50 border border-white/10 rounded-xl flex-1">
                <button
                  type="button"
                  onClick={() => handleFieldChange('type', 'expense')}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg transition ${
                    parsedData.type === 'expense'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Expense (-)
                </button>
                <button
                  type="button"
                  onClick={() => handleFieldChange('type', 'income')}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg transition ${
                    parsedData.type === 'income'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Income (+)
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 w-24">Amount ({currency.symbol}):</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono font-bold">{currency.symbol}</span>
                <input
                  type="number"
                  step="any"
                  value={parsedData.amount}
                  onChange={(e) => handleFieldChange('amount', e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl glass-input text-white text-xs font-mono font-bold focus:outline-none focus:border-violet-500 transition"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 w-24">Domain:</span>
              <select
                value={parsedData.category}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl glass-input text-white text-xs focus:outline-none focus:border-violet-500 transition cursor-pointer"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#0b0914] text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 w-24">Rail:</span>
              <select
                value={parsedData.payment_method}
                onChange={(e) => handleFieldChange('payment_method', e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl glass-input text-white text-xs focus:outline-none focus:border-violet-500 transition cursor-pointer capitalize"
              >
                <option value="upi" className="bg-[#0b0914] text-white">UPI (GPay / PhonePe / Paytm)</option>
                <option value="card" className="bg-[#0b0914] text-white">Debit / Credit Card</option>
                <option value="cash" className="bg-[#0b0914] text-white">Cash</option>
                <option value="bank_transfer" className="bg-[#0b0914] text-white">Bank Transfer / NEFT</option>
                <option value="other" className="bg-[#0b0914] text-white">Other</option>
              </select>
            </div>

            {/* Description */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 w-24">Descriptor:</span>
              <input
                type="text"
                value={parsedData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl glass-input text-white text-xs focus:outline-none focus:border-violet-500 transition"
                placeholder="Transaction description"
              />
            </div>

            {/* Date */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 w-24">Timestamp:</span>
              <input
                type="date"
                value={parsedData.date}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl glass-input text-white text-xs focus:outline-none focus:border-violet-500 transition cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>

          {!parsedData ? (
            <button
              onClick={() => triggerParse()}
              disabled={!transcript || parsing}
              className="btn-sheen flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:scale-105 disabled:opacity-50 text-white transition shadow-lg shadow-violet-600/35 magnetic-btn"
            >
              {parsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Decomposing with LLaMA 3.1...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Decompose Voice
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-sheen flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-105 disabled:opacity-50 text-white transition shadow-lg shadow-emerald-500/25 magnetic-btn"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Committing to PostgreSQL...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Commit to Ledger
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VoiceModal;
