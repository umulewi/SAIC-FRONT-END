import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import client from '../../api/client';
import './ClientPages.css';

interface Message {
  id: number;
  sender: 'client' | 'admin';
  message: string;
  is_read: number;
  created_at: string;
}

const fmtTime = (d: string) =>
  new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export default function ClientMessagesPage() {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [newMsg, setNewMsg]       = useState('');
  const [sending, setSending]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadMessages() {
    try {
      const res = await client.get('/client/messages');
      setMessages(res.data.messages ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMsg.trim() || sending) return;
    setSending(true);
    try {
      await client.post('/client/messages', { message: newMsg.trim() });
      setNewMsg('');
      await loadMessages();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="cp-page cp-messages-page">
      <div className="cp-page-header">
        <h2 className="cp-page-title">Messages</h2>
        <p className="cp-page-sub">Communicate directly with the SAIC team</p>
      </div>

      <div className="cp-chat-container">
        {loading ? (
          <div className="cp-loading">Loading messages…</div>
        ) : (
          <div className="cp-chat-body">
            {messages.length === 0 && (
              <div className="cp-chat-empty">
                <div className="cp-empty-icon">💬</div>
                <p className="cp-empty-text">No messages yet</p>
                <p className="cp-empty-sub">Send a message to start the conversation with SAIC team.</p>
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} className={`cp-bubble-row ${m.sender === 'client' ? 'cp-row-right' : 'cp-row-left'}`}>
                <div className={`cp-bubble ${m.sender === 'client' ? 'cp-bubble-client' : 'cp-bubble-admin'}`}>
                  <div className="cp-bubble-sender">
                    {m.sender === 'client' ? 'You' : 'SAIC Team'}
                  </div>
                  <div className="cp-bubble-text">{m.message}</div>
                  <div className="cp-bubble-time">{fmtTime(m.created_at)}</div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        <form className="cp-msg-form" onSubmit={sendMessage}>
          <textarea
            className="cp-msg-input"
            placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e as unknown as React.FormEvent); }
            }}
            rows={2}
            disabled={sending}
          />
          <button type="submit" className="cp-msg-send-btn" disabled={sending || !newMsg.trim()}>
            <Send size={16} />
            <span>{sending ? 'Sending…' : 'Send'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
