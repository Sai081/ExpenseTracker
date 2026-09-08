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
  AlertCircle,
  Volume2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useBYOK } from '../context/KeyContext';
import { useDemoWorkspace } from '../context/DemoWorkspaceContext';
import { CleanMarkdown } from '../components/CleanMarkdown';

export function Chat() {
  const { hasKey = false, openModal = () => {} } = useBYOK() || {};
  const demoWorkspace = useDemoWorkspace() || {};
  const { isDemo = false, transactions: demoTransactions = [], budgets: demoBudgets = [] } = demoWorkspace;
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm Spark Finance, your AI Financial Copilot. You can speak or type to ask me anything about your expenses, budgets, or savings. For example:\n\n• *\"How much have I spent on food this month?\"*\n• *\"Am I exceeding any of my category budgets?\"*\n• *\"What are my highest expenses recently?\"*\n• *\"Can I afford a ₹3,000 purchase this week?\"*"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState(''); // 'listening', 'transcribing', ''
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Setup Web Speech API if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
      setRecordingStatus('Listening to your voice...');
    };

    recognition.onresult = (e) => {
      let accumulated = '';
      for (let i = 0; i < e.results.length; i++) {
        accumulated += e.results[i][0].transcript;
      }
      setInput(accumulated);
    };

    recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      setIsListening(false);
      setRecordingStatus('');
    };

    recognition.onend = () => {
      setIsListening(false);
      setRecordingStatus('');
    };

    recognitionRef.current = recognition;
  }, []);

  // Audio recording fallback via MediaRecorder & Groq Whisper
  const startMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());

        if (audioBlob.size > 1000) {
          setRecordingStatus('Transcribing with Groq Whisper...');
          try {
            const transcript = await api.transcribeAudio(audioBlob);
            if (transcript && transcript.trim()) {
              setInput(transcript.trim());
              // Auto send voice message
              handleSend(transcript.trim());
            }
          } catch (err) {
            console.warn('Whisper fallback error:', err);
          } finally {
            setRecordingStatus('');
          }
        } else {
          setRecordingStatus('');
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsListening(true);
      setRecordingStatus('Recording audio (Groq Whisper)...');
    } catch (err) {
      alert('Microphone access denied or not supported in this browser.');
      setIsListening(false);
      setRecordingStatus('');
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
      setRecordingStatus('');
    } else {
      setInput('');
      // Prefer Web Speech API, fallback to MediaRecorder + Whisper
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          return;
        } catch (e) {
          console.warn('Recognition start failed, trying MediaRecorder:', e);
        }
      }
      // Use MediaRecorder
      startMediaRecorder();
    }
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    if (!hasKey) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: query },
        {
          role: 'assistant',
          content: '🔑 **Groq API Key Required**\n\nTo chat with ExpenseTracker AI and get dynamic answers, please configure your free Groq API key.\n\nTap the button below to paste your key:',
          keyRequired: true
        }
      ]);
      setInput('');
      if (openModal) openModal();
      return;
    }

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
      if (res.key_required && openModal) {
        openModal();
      }
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: res.reply || 'No response.',
        keyRequired: Boolean(res.key_required)
      }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${err.message || 'Failed to communicate with AI Copilot.'}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "How much have I spent on food this month?",
    "Am I on track with my budgets?",
    "What are my highest expenses recently?",
    "How much can I safely spend this week?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-4xl mx-auto animate-fade-in">
      {/* Top Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl apple-glass-card mb-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">Spark Financial Copilot</h2>
            <p className="text-xs text-slate-400">Context-aware conversational analysis powered by Groq LLaMA 3.3</p>
          </div>
        </div>

        {!hasKey && (
          <Link
            to="/settings"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Set Groq Key</span>
          </Link>
        )}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 rounded-2xl apple-glass-card shadow-xl">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isUser
                    ? 'bg-slate-800 text-emerald-400'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'glass-input text-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                {isUser ? (
                    msg.content
                  ) : (
                    <>
                      <CleanMarkdown content={msg.content} />
                      {msg.keyRequired && (
                        <div className="mt-3 pt-2 border-t border-white/10">
                          <button
                            type="button"
                            onClick={openModal}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-md transition hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Enter Groq API Key</span>
                          </button>
                        </div>
                      )}
                    </>
                  )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-2xl glass-input text-slate-400 text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              <span>Analyzing your financial data...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Status Indicator Banner */}
      {recordingStatus && (
        <div className="flex items-center gap-2 px-4 py-2 mt-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-pulse">
          <Mic className="w-4 h-4" />
          <span>{recordingStatus}</span>
        </div>
      )}

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1 text-xs whitespace-nowrap rounded-lg apple-glass-card text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition shadow-sm"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box with Voice & Send */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex items-center gap-2"
      >
        <input
          type="text"
          placeholder={isListening ? 'Listening to voice...' : 'Ask about your expenses, budgets, savings...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={`w-full pl-4 pr-24 py-3.5 rounded-2xl bg-slate-900 border text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-xl ${
            isListening ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-800 focus:border-emerald-500'
          }`}
        />

        <div className="absolute right-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleMic}
            className={`p-2 rounded-xl transition ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
            }`}
            title={isListening ? 'Stop recording' : 'Voice input'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition shadow-md shadow-emerald-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
