import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import ChatMessage from './ChatMessage';
import QuickActions from './QuickActions';

export default function ChatWindow({ onClose }) {
  const { messages, isLoading, error, sendMessage, createSession, clearError } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    try {
      await sendMessage(text);
    } catch {
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = async () => {
    try {
      await createSession();
    } catch {
    }
  };

  const handleQuickAction = (message) => {
    sendMessage(message).catch(() => {});
  };

  return (
    <div className="flex h-[550px] max-h-[80vh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#1a1a2e_0%,#16213e_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:w-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--primary),var(--secondary))] text-xs font-bold text-black">AI</span>
          <span className="text-[0.95rem] font-semibold text-white">
            Movie Assistant
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={handleNewChat}
            title="New Chat"
            className="rounded-md px-2 py-1 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            New
          </button>
          <button
            onClick={onClose}
            title="Close"
            className="rounded-md px-2 py-1 text-base text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-[14px] py-3 [scrollbar-color:rgba(255,255,255,0.15)_transparent] [scrollbar-width:thin]">
        {messages.length === 0 && !isLoading && (
          <QuickActions onSend={handleQuickAction} />
        )}

        {messages.map((msg, idx) => (
          <ChatMessage key={msg.id || idx} message={msg} />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="mb-3 flex items-start">
            <div className="rounded-[16px_16px_16px_4px] bg-white/10 px-4 py-2.5">
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`inline-block h-[7px] w-[7px] rounded-full bg-white/60 animate-pulse ${i === 1 ? '[animation-delay:150ms]' : i === 2 ? '[animation-delay:300ms]' : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between bg-red-500/15 px-[14px] py-1.5 text-[0.8rem] text-red-300">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="bg-transparent text-[0.9rem] text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/10 bg-white/[0.02] px-[14px] py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi gì đó về phim..."
            rows={1}
            className="max-h-20 flex-1 resize-none rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-[0.88rem] leading-[1.4] text-white outline-none transition placeholder:text-white/45 focus:border-[rgba(0,210,253,0.35)] focus:ring-2 focus:ring-[rgba(0,210,253,0.15)]"
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] text-sm text-white transition ${input.trim() && !isLoading ? 'cursor-pointer bg-[var(--primary,#6366f1)] hover:brightness-110' : 'cursor-default bg-white/10 text-white/50'}`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
