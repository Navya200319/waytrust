
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const TravelBuddy: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Neural link active. I provide short, accurate Indian travel intel. How can I assist?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || isTyping) return;

    const userMessage: Message = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...history, { role: 'user', parts: [{ text: messageText }] }],
        config: {
          systemInstruction: `You are the WayTrust AI Travel Buddy. 
          STRICT RULES:
          1. Be extremely short and accurate. 
          2. No conversational filler or "helpful" introductions.
          3. Provide direct facts, safety warnings, or activity names.
          4. Maximum 50 words per response.
          5. Use bullet points for lists.
          6. Focus: Indian travel, safety, hidden gems, and logistics.`,
          temperature: 0.1, // Low temperature for high accuracy/consistency
        }
      });

      const aiText = response.text || "Error: Neural sync failed.";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Error: Connection interrupted." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[320px] md:w-[380px] h-[450px] glass rounded-[2.5rem] border border-cyan-400/30 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,243,255,0.4)]">
                <i className="fas fa-robot text-white text-sm"></i>
              </div>
              <div>
                <h4 className="text-xs font-black font-orbitron text-white uppercase tracking-wider">WayTrust Companion</h4>
                <div className="flex items-center space-x-1">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Accuracy: High</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-5 space-y-4 text-xs">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-3 rounded-2xl leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-cyan-500 text-slate-950 font-bold' 
                    : 'bg-white/5 border border-white/10 text-slate-200'
                }`}>
                  {m.text.split('\n').map((line, idx) => (
                    <p key={idx} className={line.startsWith('-') || line.startsWith('*') ? 'ml-2 mb-0.5' : 'mb-1'}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex space-x-1">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/5 bg-slate-950/40">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ask about safety, gems, or routes..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-[11px] text-white focus:outline-none focus:border-cyan-400 transition-all"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={() => handleSend()}
                disabled={isTyping}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-white transition-colors"
              >
                <i className="fas fa-paper-plane text-xs"></i>
              </button>
            </div>
            <div className="mt-2 flex gap-1.5 overflow-x-auto no-scrollbar">
              {['Scam Alerts', 'Hidden Gems', 'Local Food'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => handleSend(tag)}
                  className="whitespace-nowrap px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[7px] font-black text-slate-500 uppercase tracking-widest hover:border-cyan-400/50 hover:text-cyan-400 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative group ${
          isOpen ? 'bg-red-500 rotate-90 scale-90' : 'bg-slate-900 border border-cyan-400/50 hover:scale-110'
        }`}
      >
        <div className={`absolute inset-0 rounded-full border-2 border-cyan-400/20 animate-ping ${isOpen ? 'hidden' : ''}`}></div>
        {isOpen ? (
          <i className="fas fa-times text-white text-xl"></i>
        ) : (
          <div className="relative">
             <i className="fas fa-robot text-cyan-400 text-xl group-hover:neon-text-cyan transition-all"></i>
             <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
          </div>
        )}
      </button>
    </div>
  );
};

export default TravelBuddy;
