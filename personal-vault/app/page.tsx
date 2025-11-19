"use client";

import { useState, useEffect } from "react";
import { Shield, Settings, Home, Key, User, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [popularTags, setPopularTags] = useState(["Recent files", "Passwords", "Cards", "IDs"]);
  const router = useRouter();

  useEffect(() => {
    loadPopularTags();
  }, []);

  const loadPopularTags = async () => {
    try {
      const res = await fetch('/api/vault');
      const data = await res.json();
      const allTags = [];
      data.items?.forEach(item => {
        if (item.tags) {
          allTags.push(...item.tags);
        }
      });
      const uniqueTags = [...new Set(allTags)];
      if (uniqueTags.length > 0) {
        const randomTags = uniqueTags.sort(() => 0.5 - Math.random()).slice(0, 4);
        setPopularTags(randomTags);
      }
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white flex flex-col justify-between">

      {/* Top Bar */}
      <header className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="bg-[#111113] p-2 rounded-xl border border-[#1c1c1e]">
            <Shield size={18} />
          </div>
          <h1 className="text-lg font-medium">Vault</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-sm bg-[#1c1c1e] rounded-lg border border-[#2a2a2c]">
            Private
          </span>

          <Link href="/auth/login" className="p-2 bg-[#111113] rounded-xl border border-[#1c1c1e] hover:bg-[#161618] transition">
            <User size={18} />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center text-center px-6 mt-4">

        <h2 className="text-2xl font-semibold mb-2">
          Your Personal Data Vault
        </h2>

        <p className="text-gray-400 mb-6">
          Search to intentionally reveal what you need.
        </p>

        {/* Search Card */}
        <div className="bg-[#111113] w-full max-w-xl rounded-2xl p-6 border border-[#1c1c1e] shadow-[0_0_40px_rgba(0,0,0,0.4)]">

          {/* Search Box */}
          <div className="flex items-center gap-3 bg-[#0D0D0F] px-4 py-3 rounded-xl border border-[#1c1c1e]">
            <Search size={18} className="text-gray-400" />
            <input
              placeholder="Ask anything across your vault…"
              className="bg-transparent flex-1 outline-none text-sm text-gray-200 placeholder:text-gray-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />

            {/* Shortcut Icons */}
            <div className="flex items-center gap-1">
              <span className="text-xs px-2 py-1 bg-[#1c1c1e] rounded-md text-gray-400 border border-[#2a2a2c]">
                ⌘
              </span>
              <span className="text-xs px-2 py-1 bg-[#1c1c1e] rounded-md text-gray-400 border border-[#2a2a2c]">
                K
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-500 text-sm mt-4">
            Nothing is shown by default. Your data stays private until you search.
          </p>

          {/* Categories */}
          <div className="flex flex-wrap gap-3 mt-5">
            {popularTags.map((item) => (
              <button
                key={item}
                onClick={() => router.push(`/search?q=${encodeURIComponent(item)}`)}
                className="px-4 py-2 bg-[#0D0D0F] rounded-xl text-sm border border-[#1c1c1e] text-gray-300 hover:bg-[#161618] transition"
              >
                {item}
              </button>
            ))}
          </div>

          <p className="text-gray-500 text-xs mt-6">
            Encrypted. On-device indexing. Zero-knowledge.
          </p>
        </div>

        {/* Assistant Button */}
        <Link href="/chat" className="mt-6 bg-[#43234A] text-white px-5 py-3 rounded-xl text-sm shadow-lg hover:bg-[#5e2c65] transition inline-block">
          🤖 Ask me about your vault
        </Link>
      </main>

      {/* Bottom Navigation */}
      <footer className="w-full bg-[#0D0D0F] border-t border-[#1c1c1e] py-3 flex justify-around text-gray-400">

        <NavItem icon={<Home size={20} />} label="Home" href="/" active />
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
      <span
        className={`${active ? "text-[#00E0FF]" : "text-gray-500"
          } transition`}
      >
        {icon}
      </span>
      <span
        className={`text-xs ${active ? "text-[#00E0FF]" : "text-gray-500"
          }`}
      >
        {label}
      </span>
    </Link>
  );
}
