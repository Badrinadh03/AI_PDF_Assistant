import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import ChatBox from './components/ChatBox';
import { clearSession } from './api';
import './index.css';

export default function App() {
  const [session, setSession] = useState(null); // { session_id, filename, char_count }
  const [messages, setMessages] = useState([]);

  const handleUploadSuccess = useCallback((data) => {
    setSession(data);
    setMessages([
      {
        role: 'ai',
        text: `✅ Document "${data.filename}" uploaded successfully! I've read through it${data.truncated ? ' (first 50,000 characters)' : ''}. Go ahead and ask me anything about it.`,
      },
    ]);
  }, []);

  const handleNewDocument = useCallback(async () => {
    if (session?.session_id) {
      try { await clearSession(session.session_id); } catch (_) {}
    }
    setSession(null);
    setMessages([]);
  }, [session]);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">📄</span>
            <span className="logo-text">DocQA</span>
          </div>
          <span className="tagline">AI-Powered Document Assistant</span>
        </div>
        {session && (
          <div className="header-right">
            <div className="doc-badge">
              <span className="doc-icon">📎</span>
              <span className="doc-name">{session.filename}</span>
            </div>
            <button className="btn-outline" onClick={handleNewDocument}>
              New Document
            </button>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="main">
        {!session ? (
          <div className="upload-screen">
            <div className="upload-hero">
              <h1 className="hero-title">Ask Questions About<br />Any Document</h1>
              <p className="hero-sub">
                Upload a PDF, Word, or text file and get instant AI-powered answers.
                <br />Powered by Google Gemini 1.5 Flash.
              </p>
            </div>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
            <div className="feature-grid">
              <div className="feature-card">
                <span>⚡</span>
                <h3>Fast & Accurate</h3>
                <p>Gemini 1.5 Flash reads your entire document and finds precise answers.</p>
              </div>
              <div className="feature-card">
                <span>💰</span>
                <h3>Cost Efficient</h3>
                <p>Uses minimal tokens — only your document and question are sent each time.</p>
              </div>
              <div className="feature-card">
                <span>🔒</span>
                <h3>Private</h3>
                <p>Documents are stored in memory only and never saved to disk.</p>
              </div>
            </div>
          </div>
        ) : (
          <ChatBox
            sessionId={session.session_id}
            messages={messages}
            setMessages={setMessages}
          />
        )}
      </main>
    </div>
  );
}
