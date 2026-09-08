import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Mic, 
  MicOff, 
  Loader2, 
  KeyRound, 
  X
} from 'lucide-react';
import { api } from '../lib/api';
import { useBYOK } from '../context/KeyContext';
import { useDemoWorkspace } from '../context/DemoWorkspaceContext';
import { CleanMarkdown } from './CleanMarkdown';
import { BrandLogo } from './Navbar';

export function AssistantWidget({ onTransactionCreated }) {
  const { hasKey = false, openModal = () => {} } = useBYOK() || {};
  const demoWorkspace = useDemoWorkspace() || {};
  const { isDemo = false, transactions: demoTransactions = [], budgets: demoBudgets = [] } = demoWorkspace;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hello! I am **ExpenseTracker AI**, your personal financial copilot.\n\nAsk me anything about your finances or speak to record an expense:\n• *\"How much did I spend on Food & Dining?\"*\n• *\"Can I afford a ₹1,000 dinner tonight?\"*\n• *\"What were my highest expenses recently?\"*\n• *\"Spent 450 rupees for lunch with team via UPI\"*"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioStatus, setAudioStatus] = useState('');

  // 1-minute popup reminder state
  const [showReminderBubble, setShowReminderBubble] = useState(false);
  const [reminderIndex, setReminderIndex] = useState(0);

  const reminders = [
    "👋 Financial copilot ready. Wondering about your cash flow? Ask me!",
    "💡 Want to inspect your Food & Dining budget? Let's check!",
    "🎙️ Tap mic and speak: 'Spent 450 on dinner via UPI' to log instantly!",
    "📈 Want to check your monthly net savings? Ask anytime!"
  ];

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  // Periodic 1-minute popup reminder
  useEffect(() => {
    if (isOpen) {
      setShowReminderBubble(false);
      return;
    }

    const interval = setInterval(() => {
      setReminderIndex((prev) => (prev + 1) % reminders.length);
      setShowReminderBubble(true);

      const hideTimer = setTimeout(() => {
        setShowReminderBubble(false);
      }, 10000);

      return () => clearTimeout(hideTimer);
    }, 60000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
      setAudioStatus('Listening to your voice...');
    };

    recognition.onresult = (event) => {
      let fullText = '';
      for (let i = 0; i < event.results.length; i++) {
        fullText += event.results[i][0].transcript;
      }
      setInput(fullText);
    };

    recognition.onerror = (event) => {
      console.warn('Speech error:', event.error);
      setIsListening(false);
      setAudioStatus('');
    };

    recognition.onend = () => {
      setIsListening(false);
      setAudioStatus('');
    };

    recognitionRef.current = recognition;
  }, []);

  const startMediaRecorder = async () => {
    try {
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
          setAudioStatus('Transcribing voice with Whisper...');
          try {
            const transcript = await api.transcribeAudio(audioBlob);
            if (transcript && transcript.trim()) {
              setInput(transcript.trim());
              handleSend(transcript.trim());
            }
          } catch (err) {
            console.warn('Audio transcription error:', err);
          } finally {
            setAudioStatus('');
          }
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsListening(true);
      setAudioStatus('Recording audio stream...');
    } catch (err) {
      alert('Microphone permission required for voice input.');
      setIsListening(false);
      setAudioStatus('');
    }
  };

  const stopMediaRecorder = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (mediaRecorderRef.current) {
        stopMediaRecorder();
      }
      setIsListening(false);
      setAudioStatus('');
    } else {
      setInput('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          return;
        } catch (e) {}
      }
      startMediaRecorder();
    }
  };

  const handleOpenClick = () => {
    setIsOpen(true);
    setShowReminderBubble(false);
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const newMessages = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const history = newMessages.slice(1, -1);
      const clientContext = {
        is_demo: isDemo,
        demo_transactions: isDemo ? demoTransactions : undefined,
        demo_budgets: isDemo ? demoBudgets : undefined
      };

      const res = await api.chat(query, history, clientContext);

      setMessages((prev) => [
        ...prev, 
        { 
          role: 'assistant', 
          content: res.reply || 'No response generated.',
          transaction_created: res.transaction_created
        }
      ]);

      if (res.transaction_created && onTransactionCreated) {
        onTransactionCreated();
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${err.message || 'Unable to communicate with ExpenseTracker AI.'}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "How much did I spend on food this month?",
    "Can I afford a ₹1,000 dinner tonight?",
    "Are any category budgets exceeded?",
    "Spent 450 rupees for lunch with team via UPI"
  ];

  return (
    <>
      {/* 1-Minute Pop-up Speech Bubble & Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] sm:bottom-6 right-4 sm:right-6 z-[1001] group font-sans">
          {/* Floating 1-minute Reminder Speech Bubble */}
          {showReminderBubble && (
            <div className="absolute bottom-16 right-0 w-72 sm:w-80 p-3.5 apple-glass-card rounded-2xl shadow-2xl animate-fade-in text-xs text-slate-200 z-50 border border-emerald-500/30 bg-[#071312]/95 backdrop-blur-2xl">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ExpenseTracker AI</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReminderBubble(false);
                  }}
                  className="p-1 text-slate-500 hover:text-white rounded"
                  title="Dismiss"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <p 
                onClick={handleOpenClick}
                className="cursor-pointer hover:text-emerald-300 transition leading-relaxed pt-0.5 font-medium text-slate-300"
              >
                {reminders[reminderIndex]}
              </p>

              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleOpenClick}
                  className="text-[11px] font-mono font-bold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Ask Copilot →</span>
                </button>
              </div>

              {/* Speech bubble pointer triangle */}
              <div className="absolute -bottom-2 right-6 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-[#071312]" />
            </div>
          )}

          {/* Emerald Floating Launcher Button matching Brand */}
          <button
            onClick={handleOpenClick}
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 shadow-2xl shadow-emerald-500/35 hover:scale-105 active:scale-95 transition-all duration-300"
            title="Open Financial AI Copilot"
          >
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
            </span>
            <Bot className="w-7 h-7 stroke-[2.2]" />
          </button>
          
          <div className="absolute right-16 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap apple-glass-pill text-xs font-mono font-semibold px-3 py-1.5 rounded-xl text-slate-200 shadow-xl border border-white/10 bg-[#071312]/90">
            AI Copilot Ready
          </div>
        </div>
      )}

      {/* Floating Assistant Window (Compact view only - enlarged view removed) */}
      {isOpen && (
        <div 
          className="fixed z-[1002] bottom-[calc(4.75rem+env(safe-area-inset-bottom))] sm:bottom-6 right-3 sm:right-6 w-[94vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-3xl flex flex-col apple-glass-card shadow-2xl backdrop-blur-2xl overflow-hidden font-sans border border-white/10 bg-[#071312]/95"
        >
          {/* Ambient backdrop */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/15 blur-[90px] rounded-full" />
            <div className="absolute -bottom-20 -left-16 w-64 h-64 bg-teal-500/10 blur-[90px] rounded-full" />
            <div className="landing-noise opacity-20" />
          </div>

          {/* Header Bar */}
          <div className="flex items-center justify-between p-4 bg-white/[0.02] border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-sm">
                <BrandLogo className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
                  <span>ExpenseTracker AI</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold font-mono">
                    Copilot
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">Real-time Financial Intelligence</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={openModal}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition mr-1"
                title="Groq API Key configuration"
              >
                <KeyRound className="w-3 h-3 text-emerald-400" />
                <span>{hasKey ? 'BYOK Set' : 'Custom Key'}</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex items-start gap-2.5 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`p-1.5 rounded-xl shrink-0 ${
                      isUser
                        ? 'bg-slate-800 text-emerald-400'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-tr-none shadow-md font-sans'
                        : 'bg-white/[0.035] border border-white/[0.08] text-slate-200 rounded-tl-none shadow-md'
                    }`}
                  >
                    {isUser ? msg.content : <CleanMarkdown content={msg.content} />}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-slate-400 text-xs flex items-center gap-2 font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Analyzing your transactions & budgets...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Status Indicator */}
          {audioStatus && (
            <div className="mx-4 mb-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2 animate-pulse font-mono">
              <Mic className="w-3.5 h-3.5" />
              <span>{audioStatus}</span>
            </div>
          )}

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2 bg-black/40 border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto no-scrollbar">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="px-2.5 py-1 text-[10px] font-mono whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 hover:text-emerald-300 hover:border-emerald-500/30 transition shrink-0"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Controls */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white/[0.02] border-t border-white/[0.08] flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={
                isListening 
                  ? 'Listening to voice... speak now' 
                  : 'Ask about food, budgets, or speak an expense...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`flex-1 px-3.5 py-2.5 rounded-2xl bg-white/[0.03] border text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition font-sans ${
                isListening ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-white/10 focus:border-emerald-400/60'
              }`}
            />

            <button
              type="button"
              onClick={toggleMic}
              className={`p-2.5 rounded-2xl transition ${
                isListening
                  ? 'bg-emerald-500 text-slate-950 animate-pulse shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-white/5 border border-white/[0.08]'
              }`}
              title={isListening ? "Stop voice input" : "Voice input"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold disabled:opacity-40 transition shadow-md shadow-emerald-500/25 active:scale-95"
              title="Send query"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
