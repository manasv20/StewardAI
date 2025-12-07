import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { InvestmentPlan, ChatMessage, GroundingSource } from '../types';
import { createAdvisorChat } from '../services/geminiService';
import { Chat } from "@google/genai";
import { Send, X, MessageSquare, User, Bot, Loader2, Zap, Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  plan: InvestmentPlan;
  apiKey: string;
}

export interface AgentChatRef {
    triggerChat: (message: string) => void;
}

const QUICK_ACTIONS = [
    "How does this plan protect against inflation?",
    "Explain the importance of tax efficiency.",
    "Why is diversification a core principle?",
    "What is the role of bonds in this portfolio?"
];

const AgentChat = forwardRef<AgentChatRef, Props>(({ plan, apiKey }, ref) => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
      triggerChat: (message: string) => {
          handleSend(message);
          // Focus input after programmatic send
          inputRef.current?.focus();
      }
  }));

  // Load from local storage or init
  useEffect(() => {
    const storedHistory = localStorage.getItem('steward_ai_chat_history');
    if (storedHistory) {
        try {
            const parsed = JSON.parse(storedHistory);
            setMessages(parsed);
        } catch (e) {
            console.error("Failed to parse chat history", e);
            setMessages([{ role: 'model', text: "I have reviewed your legacy plan. The principles are sound and the strategy is aligned with your long-term goals. How may I provide clarity or guidance?" }]);
        }
    } else {
        setMessages([{ role: 'model', text: "I have reviewed your legacy plan. The principles are sound and the strategy is aligned with your long-term goals. How may I provide clarity or guidance?" }]);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (messages.length > 0) {
        localStorage.setItem('steward_ai_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (plan && apiKey) {
      // Pass the *history* to the chat creation so context is preserved in the AI session too
      const historyForAI = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const chat = createAdvisorChat(plan, apiKey, historyForAI);
      setChatSession(chat);
    }
  }, [plan, apiKey]); // Re-init if plan changes (re-generation) or key changes

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || !chatSession) return;

    const userMsg = text;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsThinking(true);

    try {
      const result = await chatSession.sendMessage({ message: userMsg });
      const responseText = result.text;
      
      // Extract sources if any (from Google Search tool)
      const sources: GroundingSource[] = [];
      const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
            if (chunk.web?.uri && chunk.web?.title) {
            sources.push({ title: chunk.web.title, url: chunk.web.uri });
            }
        });
      }

      setMessages(prev => [...prev, { role: 'model', text: responseText, sources }]);
    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, { role: 'model', text: "Apologies, there was a data stream interruption. Please re-submit your query." }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[600px]">
      
      {/* Header */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center border border-sky-500/50">
                <Bot className="w-6 h-6 text-sky-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950"></div>
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">The Steward</h3>
            <p className="text-xs text-sky-500 font-medium flex items-center gap-1">
                Your AI Wealth Advisor <span className="text-slate-600">•</span> Online
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-900/95 scroll-smooth">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-700' : 'bg-sky-900/30 border border-sky-500/20'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-slate-300" /> : <Bot className="w-4 h-4 text-sky-400" />}
            </div>
            <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                    ? 'bg-slate-800 text-white rounded-tr-none border border-slate-700' 
                    : 'bg-slate-950 text-slate-200 rounded-tl-none border border-slate-800'
                }`}>
                <ReactMarkdown className="prose prose-invert prose-sm max-w-none break-words">
                    {msg.text}
                </ReactMarkdown>
                </div>
                
                {/* Sources Citation */}
                {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                        {msg.sources.map((src, i) => (
                             <a 
                                key={i}
                                href={src.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px] text-blue-400 hover:text-blue-300 hover:border-blue-800 transition-colors"
                             >
                                <ExternalLink className="w-3 h-3" />
                                {src.title}
                             </a>
                        ))}
                    </div>
                )}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex gap-3 animate-pulse">
             <div className="w-8 h-8 rounded-full bg-sky-900/30 border border-sky-500/20 flex-shrink-0 flex items-center justify-center">
                <Bot className="w-4 h-4 text-sky-400" />
             </div>
             <div className="bg-slate-950 text-slate-400 rounded-2xl rounded-tl-none border border-slate-800 px-4 py-3 text-xs flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Contemplating...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input & Chips */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
        {/* Quick Action Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {QUICK_ACTIONS.map((action, i) => (
                <button
                    key={i}
                    onClick={() => handleSend(action)}
                    disabled={isThinking}
                    className="flex-shrink-0 px-3 py-1 bg-slate-800/50 hover:bg-sky-900/30 border border-slate-700 hover:border-sky-500/50 text-xs text-slate-300 hover:text-sky-400 rounded-full transition-all whitespace-nowrap"
                >
                    {action}
                </button>
            ))}
        </div>

        <div className="relative flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask a question about your legacy plan..."
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl pl-4 pr-12 py-3 focus:ring-1 focus:ring-sky-500 outline-none placeholder:text-slate-600 transition-all"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isThinking}
            className="absolute right-2 p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-600 text-center">
            The Steward provides guidance based on timeless financial principles. This is not financial advice.
        </p>
      </div>
    </div>
  );
});

export default AgentChat;
