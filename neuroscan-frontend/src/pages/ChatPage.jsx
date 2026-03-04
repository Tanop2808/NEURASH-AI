import { useState, useRef, useEffect } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am Neuro Bot powered by Gemini.. I can help you understand brain MRI results, explain medical terminology, or answer general neurology questions. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const bottomRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://neurash-ai.onrender.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();
      const reply = data.reply || data.error || 'Sorry, I could not generate a response.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = [
    'What does "No Tumor" result mean?',
    'How accurate is AI brain scan analysis?',
    'What are symptoms of a brain tumor?',
    'Explain MRI scan procedure',
  ];

  return (
    <div className="min-h-screen relative z-10 px-4 py-8">
      <div className="max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>

        <div className={`mb-6 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <span className="badge mb-3 inline-block" style={{ background: 'rgba(0,210,200,0.1)', color: '#00d2c8', border: '1px solid rgba(0,210,200,0.2)' }}>
            Neuro Bot · Gemini Powered
          </span>
          <h1 className="text-3xl font-bold mb-1">Neuro Bot</h1>
          <p style={{ color: 'rgba(232,240,254,0.45)', fontSize: '0.875rem' }}>Ask anything about brain MRI, neurology, or your scan results</p>
        </div>

        <div className={`glass rounded-2xl flex-1 flex flex-col overflow-hidden ${mounted ? 'animate-fadeInUp delay-1' : 'opacity-0'}`} style={{ border: '1px solid rgba(0,210,200,0.1)' }}>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeInUp`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 mt-1" style={{
                    background: 'rgba(0,210,200,0.1)',
                    border: '1px solid rgba(0,210,200,0.2)'
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#00d2c8" strokeWidth="1.5"/>
                      <circle cx="12" cy="12" r="4" fill="rgba(0,210,200,0.3)" stroke="#00d2c8" strokeWidth="1"/>
                    </svg>
                  </div>
                )}
                <div
                  className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  style={{
                    maxWidth: '75%',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #00d2c8, #0099cc)'
                      : 'rgba(255,255,255,0.04)',
                    color: msg.role === 'user' ? '#050810' : 'rgba(232,240,254,0.85)',
                    border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    fontWeight: msg.role === 'user' ? 600 : 400,
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px'
                  }}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center ml-3 flex-shrink-0 mt-1" style={{
                    background: 'rgba(0,210,200,0.1)',
                    border: '1px solid rgba(0,210,200,0.2)'
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="#00d2c8" strokeWidth="1.5"/>
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#00d2c8" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mr-3 flex-shrink-0" style={{
                  background: 'rgba(0,210,200,0.1)',
                  border: '1px solid rgba(0,210,200,0.2)'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#00d2c8" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="4" fill="rgba(0,210,200,0.3)" stroke="#00d2c8" strokeWidth="1"/>
                  </svg>
                </div>
                <div className="rounded-2xl px-5 py-4 flex items-center gap-1.5" style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '18px 18px 18px 4px'
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6,
                      borderRadius: '50%',
                      background: '#00d2c8',
                      animation: `pulse-glow 1.2s ease-in-out ${i * 0.2}s infinite`
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && (
            <div className="px-5 pb-3">
              <p className="text-xs mb-2" style={{ color: 'rgba(232,240,254,0.3)', fontFamily: 'Syne' }}>SUGGESTED QUESTIONS</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(s)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      background: 'rgba(0,210,200,0.06)',
                      border: '1px solid rgba(0,210,200,0.15)',
                      color: 'rgba(232,240,254,0.6)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,210,200,0.12)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,210,200,0.06)'}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4" style={{ borderTop: '1px solid rgba(0,210,200,0.08)' }}>
            <div className="flex gap-3 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about brain MRI, neurology, or scan results..."
                rows={1}
                className="input-neo flex-1 rounded-xl px-4 py-3 text-sm resize-none"
                style={{ minHeight: 44, maxHeight: 120 }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="btn-glow rounded-xl px-5 py-3 text-sm flex-shrink-0"
                style={{ opacity: (!input.trim() || loading) ? 0.5 : 1, cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: 'rgba(232,240,254,0.2)' }}>
              Press Enter to send · Shift+Enter for new line · For educational purposes only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}