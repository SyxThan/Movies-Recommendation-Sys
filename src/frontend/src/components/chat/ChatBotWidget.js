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
    <div className="fixed bottom-4 right-4 z-[9999] sm:bottom-6 sm:right-6">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-3">
          <ChatWindow onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Floating Action Button */}
      <div className="flex justify-end">
        <button
          onClick={handleToggle}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--primary,#6366f1),#4f46e5)] text-2xl text-white shadow-[0_6px_24px_rgba(99,102,241,0.4)] transition duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgba(99,102,241,0.55)]"
        >
          {isOpen ? '✕' : 'Chat'}
        </button>
      </div>
    </div>
  );
}
