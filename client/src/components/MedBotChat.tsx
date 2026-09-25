import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import {
  MessageCircle, X, Send, Bot, User, Sparkles,
  ChevronDown, RotateCcw, AlertTriangle
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'bot';
  heading?: string;
  text: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  'What medicines help with high cholesterol?',
  'My HbA1c is 7.2, what should I do?',
  'Which Vitamin D supplement is best?',
  'My SGPT is elevated, what helps?',
  'What are Iron deficiency medicines?',
  'Tell me about thyroid medications',
];

function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Bold + italic inline
    const renderInline = (str: string) => {
      const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
      return parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={j} className="italic text-slate-600">{part.slice(1, -1)}</em>;
        }
        return <span key={j}>{part}</span>;
      });
    };

    if (line.startsWith('• ') || line.startsWith('- ')) {
      elements.push(
        <div key={i} className="flex items-start space-x-2 text-xs text-slate-700 leading-relaxed">
          <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
          <span>{renderInline(line.slice(2))}</span>
        </div>
      );
    } else if (line.startsWith('⚠️')) {
      elements.push(
        <div key={i} className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start space-x-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
          <span className="text-[11px] text-amber-800 font-medium">{line.slice(3).trim()}</span>
        </div>
      );
    } else if (line.startsWith('📋') || line.startsWith('📋')) {
      elements.push(
        <div key={i} className="mt-2 p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-[11px] text-teal-800">
          {renderInline(line)}
        </div>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1.5" />);
    } else {
      elements.push(
        <p key={i} className="text-xs text-slate-700 leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
    i++;
  }
  return elements;
}

export const MedBotChat: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      heading: '👋 Hello! I\'m MedBot',
      text: 'I\'m your HealthBridge AI Medical Assistant. I can help you understand your test results and suggest medicines based on your diagnosis.\n\nAsk me anything about your health! 💊',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setShowQuickPrompts(false);

    try {
      const res = await api.post('/chat/message', { message: text.trim() });
      const { response } = res.data;
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        heading: response.heading,
        text: response.body,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        heading: '⚠️ Connection Error',
        text: 'Unable to connect to MedBot. Please ensure the server is running and try again.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'bot',
      heading: '👋 Hello! I\'m MedBot',
      text: 'I\'m your HealthBridge AI Medical Assistant. I can help you understand your test results and suggest medicines based on your diagnosis.\n\nAsk me anything about your health! 💊',
      timestamp: new Date()
    }]);
    setShowQuickPrompts(true);
    setInput('');
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="group relative w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-2xl hover:shadow-teal-400/40 hover:scale-110 transition-all duration-300 flex items-center justify-center"
            title="Open MedBot AI Assistant"
          >
            <Bot className="w-7 h-7" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-teal-500 animate-ping opacity-25" />
            {/* Tooltip */}
            <span className="absolute -top-10 right-0 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
              Ask MedBot AI
            </span>
          </button>
        )}

        {/* Chat Window */}
        {open && (
          <div className="w-[370px] h-[580px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">

            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-teal-900 px-4 py-3.5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-black text-white text-sm">MedBot AI</span>
                    <Sparkles className="w-3 h-3 text-teal-400" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-slate-400">Medical AI Assistant • Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button onClick={resetChat} className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Reset chat">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Disclaimer strip */}
            <div className="bg-amber-50 border-b border-amber-100 px-3 py-1.5 flex items-center space-x-1.5 flex-shrink-0">
              <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
              <span className="text-[10px] text-amber-700 font-medium">For informational use only. Not a substitute for medical advice.</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map(msg => (
                <div key={msg.id} className={`flex items-start space-x-2.5 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center ${
                    msg.role === 'bot'
                      ? 'bg-gradient-to-br from-teal-500 to-teal-700'
                      : 'bg-slate-200'
                  }`}>
                    {msg.role === 'bot'
                      ? <Bot className="w-4 h-4 text-white" />
                      : <User className="w-4 h-4 text-slate-500" />
                    }
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[280px] rounded-2xl px-3.5 py-3 space-y-2 ${
                    msg.role === 'user'
                      ? 'bg-teal-600 text-white rounded-tr-sm'
                      : 'bg-white border border-slate-200/80 shadow-sm rounded-tl-sm'
                  }`}>
                    {msg.role === 'bot' && msg.heading && (
                      <p className="font-black text-sm text-slate-900 border-b border-slate-100 pb-2">
                        {msg.heading}
                      </p>
                    )}
                    {msg.role === 'user' ? (
                      <p className="text-xs text-white">{msg.text}</p>
                    ) : (
                      <div className="space-y-1.5">{parseMarkdown(msg.text)}</div>
                    )}
                    <p className={`text-[9px] ${msg.role === 'user' ? 'text-teal-200' : 'text-slate-400'} text-right`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex items-start space-x-2.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Quick prompts */}
              {showQuickPrompts && messages.length === 1 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Questions</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="text-[10px] font-semibold px-2.5 py-1.5 rounded-xl bg-white border border-teal-200 text-teal-700 hover:bg-teal-50 transition-colors text-left leading-tight"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-200 bg-white flex-shrink-0">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask about medicines, supplements..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  maxLength={500}
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-400 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 flex-shrink-0 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
              <p className="text-[9px] text-slate-400 text-center mt-1.5">Powered by HealthBridge MedBot AI</p>
            </div>

          </div>
        )}
      </div>
    </>
  );
};
