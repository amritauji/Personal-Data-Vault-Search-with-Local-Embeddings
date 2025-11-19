"use client";

import { useState } from "react";
import { Shield, Settings, Home, Key, User, Send, Bot, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  sources?: { title: string; similarity: number }[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I can help you find information from your vault. Ask me anything about your notes!",
      isUser: false,
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      const botMessage: Message = {
        id: Date.now() + 1,
        text: data.response,
        isUser: false,
        sources: data.sources,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Sorry, I couldn't process your request. Please try again.",
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white flex flex-col">
      {/* Top Bar */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-[#1c1c1e]">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-2 bg-[#111113] rounded-xl border border-[#1c1c1e] hover:bg-[#161618] transition">
            <ArrowLeft size={18} />
          </Link>
          <div className="bg-[#111113] p-2 rounded-xl border border-[#1c1c1e]">
            <Bot size={18} />
          </div>
          <h1 className="text-lg font-medium">Vault Assistant</h1>
        </div>

        <button className="p-2 bg-[#111113] rounded-xl border border-[#1c1c1e] hover:bg-[#161618] transition">
          <Settings size={18} />
        </button>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                message.isUser
                  ? "bg-[#43234A] text-white"
                  : "bg-[#111113] border border-[#1c1c1e]"
              }`}
            >
              <p className="text-sm">{message.text}</p>
              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#1c1c1e]">
                  <p className="text-xs text-gray-400 mb-2">Sources:</p>
                  <div className="space-y-1">
                    {message.sources.map((source, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-[#00E0FF]">{source.title}</span>
                        <span className="text-gray-400">{source.similarity}% match</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#111113] border border-[#1c1c1e] p-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-[#43234A] border-t-transparent rounded-full"></div>
                <span className="text-sm text-gray-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-[#1c1c1e]">
        <div className="flex items-center gap-3 bg-[#111113] border border-[#1c1c1e] rounded-2xl p-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your vault notes..."
            className="flex-1 bg-transparent outline-none text-sm resize-none"
            rows={1}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="p-2 bg-[#43234A] text-white rounded-xl hover:bg-[#5e2c65] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <footer className="w-full bg-[#0D0D0F] border-t border-[#1c1c1e] py-3 flex justify-around text-gray-400">
        <NavItem icon={<Home size={20} />} label="Home" href="/" />
        <NavItem icon={<Shield size={20} />} label="Vault" href="/vault" />
        <NavItem icon={<Key size={20} />} label="Keys" href="/keys" />
        <NavItem icon={<User size={20} />} label="Profile" href="/profile" />
      </footer>
    </div>
  );
}

function NavItem({
  icon,
  label,
  href,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1">
      <span className={`${active ? "text-[#00E0FF]" : "text-gray-500"} transition`}>
        {icon}
      </span>
      <span className={`text-xs ${active ? "text-[#00E0FF]" : "text-gray-500"}`}>
        {label}
      </span>
    </Link>
  );
}