import React, { useCallback } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import ChatWindow from './ChatWindow';

export default function ChatBotWidget() {
  const { isOpen, setIsOpen, activeSession, createSession } = useChat();
  const { isAuthenticated } = useAuth();

  const handleToggle = useCallback(async () => {
    if (!isOpen) {
      if (!activeSession) {
        try {
          await createSession();
        } catch {
          return; // error handled by context
        }
      }
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isOpen, activeSession, createSession, setIsOpen]);

  if (!isAuthenticated) return null;

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {/* Chat Window */}
      {isOpen && (
        <div style={{ marginBottom: 12 }}>
          <ChatWindow onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Floating Action Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleToggle}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(135deg, var(--primary, #6366f1), var(--primary-dark, #4f46e5))',
            color: '#fff',
            fontSize: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(99, 102, 241, 0.55)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(99, 102, 241, 0.4)';
          }}
        >
          {isOpen ? '✕' : '💬'}
        </button>
      </div>
    </div>
  );
}
