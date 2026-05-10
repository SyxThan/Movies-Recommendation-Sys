import React, { createContext, useContext, useState, useCallback } from 'react';
import chatApi from '../api/chatApi';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);

  const createSession = useCallback(async () => {
    try {
      const data = await chatApi.createSession();
      setActiveSession(data);
      setMessages([]);
      setError(null);
      return data;
    } catch (err) {
      console.error('[ChatContext] createSession failed:', err);
      setError('Không thể tạo phiên chat mới');
      throw err;
    }
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!activeSession) return;
    setError(null);

    const tempUserMsg = {
      id: Date.now(),
      sender_type: 'user',
      content: text,
      recommended_movies: [],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const data = await chatApi.sendMessage(activeSession.id, text);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        data.user_message,
        { ...data.bot_response, recommended_movies_data: data.recommended_movies },
      ]);
      return data;
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      setError('Có lỗi xảy ra, thử lại nhé');
      console.error('[ChatContext] sendMessage failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeSession]);

  const loadSessionMessages = useCallback(async (sessionId) => {
    try {
      const data = await chatApi.getSessionMessages(sessionId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[ChatContext] loadSessionMessages failed:', err);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <ChatContext.Provider value={{
      activeSession, messages, isLoading, isOpen, error,
      setIsOpen, createSession, sendMessage, loadSessionMessages, clearError,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside ChatProvider');
  return ctx;
}
