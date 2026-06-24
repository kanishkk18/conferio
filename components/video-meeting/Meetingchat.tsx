'use client';
import React, { useEffect, useRef, useState } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatMessage {
  id: string;
  name: string;
  image?: string;
  text: string;
  time: string;
  isSelf?: boolean;
}

interface Props {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onClose: () => void;
  displayName: string;
  userImage?: string;
}

export default function MeetingChat({ messages, onSend, onClose, displayName, userImage }: Props) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput('');
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4text-blue-400" />
          <span className="text-white font-semibold text-sm">Meeting Chat</span>
          <span className="text-neutral-500 text-xs bg-neutral-800 px-1.5 py-0.5 rounded-full">{messages.length}</span>
        </div>
        <button type="button" onClick={onClose} className="p-1 text-neutral-500 hover:text-white transition-colors">
          <X className="size-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="size-8 text-neutral-700 mx-auto mb-2" />
            <p className="text-neutral-600 text-sm">No messages yet</p>
            <p className="text-neutral-700 text-xs mt-1">Say hello to everyone!</p>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 ${msg.isSelf ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className="size-8 rounded-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              {msg.image
                ? <img src={msg.image} alt="" className="w-full h-full object-cover" />
                : <span className="text-white text-[10px] font-bold">{msg.name?.[0]?.toUpperCase()}</span>
              }
            </div>

            {/* Bubble */}
            <div className={`max-w-[75%] ${msg.isSelf ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400 text-[10px]">
                  {msg.isSelf ? 'You' : msg.name}
                </span>
                <span className="text-neutral-700 text-[9px]">{formatTime(msg.time)}</span>
              </div>
              <div
                className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.isSelf
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-neutral-800 text-neutral-100 rounded-tl-sm'
                  }`}
              >
                {msg.text}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="  p-3  border-t border-neutral-800 flex-shrink-0">
        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 focus-within:border-blue-500 transition-colors">
          <input
            aria-label="meeting-message-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Message everyone…"
            className="flex-1 bg-transparent text-white text-sm placeholder-neutral-600 outline-none"
          />
          <button type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-neutral-700 text-[10px] mt-1.5 text-center">
          Messages are visible to all participants
        </p>
      </div>
    </div>
  );
}
