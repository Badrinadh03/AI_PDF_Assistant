import React, { useState, useRef, useEffect, useCallback } from 'react';
import { askQuestion } from '../api';

export default function ChatBox({ sessionId, messages, setMessages }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();
  const textareaRef = useRef();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const sendMessage = useCallback(async () => {
    const question = input.trim();
    if (!question || loading) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

    try {
      const data = await askQuestion(sessionId, question);
      setMessages(prev => [...prev, { role: 'ai', text: data.answer }]);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Something went wrong. Please try again.';
      setMessages(prev => [...prev, { role: 'ai', text: `⚠️ ${msg}`, isError: true }]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }, [input, loading, sessionId, setMessages]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Suggested questions
  const suggestions = [
    'Summarize this document',
    'What are the key points?',
    'What is the main topic?',
    'List all important dates or numbers',
  ];

  return (
    <div className="chat-container">
      {/* Messages */}
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message-row ${msg.role}`}>
            <div className="avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className={`bubble ${msg.isError ? 'error' : ''}`}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message-row ai">
            <div className="avatar">🤖</div>
            <div className="bubble typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (shown only at start) */}
      {messages.length <= 1 && !loading && (
        <div className="suggestions">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="suggestion-chip"
              onClick={() => { setInput(s); textareaRef.current?.focus(); }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="input-bar">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={onKeyDown}
          placeholder="Ask a question about your document…"
          rows={1}
          disabled={loading}
        />
        <button
          className={`send-btn ${loading ? 'disabled' : ''}`}
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          aria-label="Send"
        >
          {loading ? (
            <div className="btn-spinner" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
      <p className="input-hint">Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
