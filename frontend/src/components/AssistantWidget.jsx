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
  Maximize2, 
  Minimize2, 
  X, 
  CheckCircle2,
  Lock,
  Volume2
} from 'lucide-react';
import { api } from '../lib/api';
import { useBYOK } from '../context/KeyContext';

export function AssistantWidget({ onTransactionCreated }) {
  const { hasKey, openModal } = useBYOK();
  const [isOpen, setIsOpen] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Telemetry Online. I am **ExpenseTracker AI**, your sovereign financial orchestration copilot.\n\n• **Query Balance**: *\"How much did I burn on dining this week?\"*\n• **Audit Caps**: *\"Am I exceeding any velocity envelopes?\"*\n• **Autonomous Log**: *\"Spent 450 rupees for lunch with team via UPI\"*"
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
    "👋 Autonomous Copilot ready. Wondering about your cash flow? Ask me!",
    "💡 Want to inspect your Food & Dining velocity envelope? Let's check!",
    "🎙️ Tap mic and speak: 'Spent 450 on dinner via UPI' to log instantly!",
    "📈 Want to project your 12-month net retained savings? Ask anytime!"
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
      setAudioStatus('Listening to acoustic stream...');
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
    if (!hasKey) {
      openModal();
      return;
    }
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
          setAudioStatus('Transcribing via Groq Whisper v3...');
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
    if (!hasKey) {
      openModal();
      return;
    }

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
    if (!hasKey) {
      openModal();
      return;
    }

    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const newMessages = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const history = newMessages.slice(1, -1);
      const res = await api.chat(query, history);

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
    "What is my Food & Dining burn rate?",
    "Spent 450 rupees for lunch with team via UPI",
    "Are any category envelopes exceeded?",
    "Project my 12-month net retained alpha"
  ];

  return (
    <>
      {/* 1-Minute Pop-up Speech Bubble & Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 group font-['Space_Grotesk',sans-serif]">
          {/* Floating 1-minute Reminder Speech Bubble */}
          {showReminderBubble && (
            <div className="absolute bottom-16 right-0 w-72 sm:w-80 p-3.5 apple-glass-card rounded-2xl shadow-2xl animate-fade-in text-xs text-slate-200 z-50 border border-violet-500/40">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 text-violet-400 font-bold font-mono">
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
                className="cursor-pointer hover:text-violet-300 transition leading-relaxed pt-0.5 font-medium"
              >
                {reminders[reminderIndex]}
              </p>

              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleOpenClick}
                  className="text-[11px] font-mono font-bold text-violet-400 hover:underline flex items-center gap-1"
                >
                  <span>Query Copilot →</span>
                </button>
              </div>

              {/* Speech bubble pointer triangle */}
              <div className="absolute -bottom-2 right-6 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-[#0b0914]" />
            </div>
          )}

          {/* Electric Violet Pulsing Launcher (matches screenshot) */}
          <button
            onClick={handleOpenClick}
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-2xl shadow-violet-600/45 hover:scale-105 active:scale-95 transition-all duration-300 magnetic-btn"
            title="Open Autonomous Voice Copilot"
          >
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400" />
            </span>
            <Bot className="w-7 h-7 stroke-[2.2]" />
          </button>
          
          <div className="absolute right-16 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap apple-glass-pill text-xs font-mono font-semibold px-3 py-1.5 rounded-xl text-slate-200 shadow-xl">
            Voice Copilot Ready
          </div>
        </div>
      )}

      {/* Floating Assistant Window */}
      {isOpen && (
        <div 
          className={`fixed z-50 flex flex-col apple-glass-card shadow-2xl backdrop-blur-2xl transition-all duration-300 overflow-hidden font-['Space_Grotesk',sans-serif] border border-violet-500/30 ${
            isEnlarged
              ? 'inset-4 sm:inset-8 max-w-4xl mx-auto rounded-3xl'
              : 'bottom-6 right-6 w-[92vw] sm:w-[420px] h-[600px] max-h-[85vh] rounded-3xl'
          }`}
        >
          {/* Ambient backdrop */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-violet-600/20 blur-[90px] rounded-full" />
            <div className="absolute -bottom-20 -left-16 w-64 h-64 bg-cyan-600/15 blur-[90px] rounded-full" />
            <div className="absolute inset-0 bg-grid opacity-30" />
          </div>

          {/* Header Bar */}
          <div className="flex items-center justify-between p-4 bg-[#08070d]/80 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-600/30">
                <Bot className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-['Syne',sans-serif]">
                  <span>ExpenseTracker AI</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/30 font-bold font-mono">
                    LLaMA 3.1
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">Autonomous Financial Copilot</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!hasKey && (
                <button
                  onClick={openModal}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition mr-1"
                  title="Connect Groq API key"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Connect Key</span>
                </button>
              )}

              <button
                onClick={() => setIsEnlarged(!isEnlarged)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
                title={isEnlarged ? "Compact view" : "Enlarge view"}
              >
                {isEnlarged ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsEnlarged(false);
                }}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* BYOK Notice Banner */}
          {!hasKey && (
            <div className="px-4 py-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs flex items-center justify-between font-mono">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Client-side Groq Key required for copilot.</span>
              </div>
              <button
                onClick={openModal}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition ml-2 shrink-0"
              >
                Configure
              </button>
            </div>
          )}

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
                        ? 'bg-slate-800 text-violet-400'
                        : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-tr-none shadow-md font-sans'
                        : 'apple-glass border border-white/[0.08] text-slate-200 rounded-tl-none shadow-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="px-3 py-2 rounded-2xl glass-input text-slate-400 text-xs flex items-center gap-2 font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
                  <span>Synthesizing inference...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Status Indicator */}
          {audioStatus && (
            <div className="mx-4 mb-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2 animate-pulse font-mono">
              <Mic className="w-3.5 h-3.5" />
              <span>{audioStatus}</span>
            </div>
          )}

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2 bg-black/40 border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto no-scrollbar">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (!hasKey) {
                    openModal();
                  } else {
                    handleSend(p);
                  }
                }}
                className="px-2.5 py-1 text-[10px] font-mono whitespace-nowrap rounded-lg apple-glass-pill text-slate-300 hover:text-violet-300 hover:border-violet-500/40 transition shrink-0"
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
            className="p-3 bg-[#08070d]/90 border-t border-white/[0.08] flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={
                !hasKey 
                  ? 'Connect Groq key to activate copilot...' 
                  : isListening 
                  ? 'Acoustic stream active... speak now' 
                  : 'Type prompt or speak expense...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onClick={() => {
                if (!hasKey) openModal();
              }}
              className={`flex-1 px-3.5 py-2.5 rounded-2xl glass-input text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition ${
                isListening ? 'border-rose-500 ring-2 ring-rose-500/20' : 'focus:border-violet-500'
              }`}
            />

            <button
              type="button"
              onClick={toggleMic}
              className={`p-2.5 rounded-2xl transition ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                  : 'text-slate-400 hover:text-violet-400 hover:bg-white/5 border border-white/[0.08]'
              }`}
              title={!hasKey ? "Connect Groq key" : isListening ? "Stop stream" : "Acoustic input"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-sheen p-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:scale-105 disabled:opacity-40 text-white transition shadow-md shadow-violet-600/30 magnetic-btn"
              title="Commit prompt"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
