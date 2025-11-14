"use client";

import { useState } from "react";
import { Shield, Settings, Home, Key, User, Plus, Eye, EyeOff, Copy } from "lucide-react";
import Link from "next/link";

export default function KeysPage() {
  const [keys] = useState([
    { id: 1, name: "Gmail", username: "user@gmail.com", lastUsed: "Today" },
    { id: 2, name: "GitHub", username: "developer", lastUsed: "2 days ago" },
    { id: 3, name: "AWS Console", username: "admin", lastUsed: "1 week ago" },
  ]);

  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());

  const togglePasswordVisibility = (id: number) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisiblePasswords(newVisible);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white flex flex-col justify-between">
      {/* Top Bar */}
      <header className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="bg-[#111113] p-2 rounded-xl border border-[#1c1c1e]">
            <Key size={18} />
          </div>
          <h1 className="text-lg font-medium">Keys</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-sm bg-[#1c1c1e] rounded-lg border border-[#2a2a2c]">
            {keys.length} keys
          </span>
          <button className="p-2 bg-[#111113] rounded-xl border border-[#1c1c1e] hover:bg-[#161618] transition">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Password Manager</h2>
          <button className="flex items-center gap-2 bg-[#43234A] text-white px-4 py-2 rounded-xl text-sm hover:bg-[#5e2c65] transition">
            <Plus size={16} />
            Add Password
          </button>
        </div>

        {/* Password Items */}
        <div className="space-y-3">
          {keys.map((key) => (
            <div
              key={key.id}
              className="bg-[#111113] p-4 rounded-xl border border-[#1c1c1e] hover:bg-[#161618] transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-[#0D0D0F] p-2 rounded-lg border border-[#1c1c1e]">
                    <Key size={16} className="text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">{key.name}</h3>
                    <p className="text-sm text-gray-400">{key.username} • {key.lastUsed}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePasswordVisibility(key.id)}
                    className="p-2 bg-[#0D0D0F] rounded-lg border border-[#1c1c1e] hover:bg-[#161618] transition"
                  >
                    {visiblePasswords.has(key.id) ? (
                      <EyeOff size={14} className="text-gray-400" />
                    ) : (
                      <Eye size={14} className="text-gray-400" />
                    )}
                  </button>
                  <button className="p-2 bg-[#0D0D0F] rounded-lg border border-[#1c1c1e] hover:bg-[#161618] transition">
                    <Copy size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>
              
              {visiblePasswords.has(key.id) && (
                <div className="mt-3 pt-3 border-t border-[#1c1c1e]">
                  <div className="bg-[#0D0D0F] p-3 rounded-lg border border-[#1c1c1e]">
                    <p className="text-sm font-mono text-gray-300">••••••••••••</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {keys.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-[#111113] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1c1c1e]">
              <Key size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No passwords saved</h3>
            <p className="text-gray-400 mb-4">Add your first password to get started</p>
            <button className="bg-[#43234A] text-white px-4 py-2 rounded-xl text-sm hover:bg-[#5e2c65] transition">
              Add Password
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <footer className="w-full bg-[#0D0D0F] border-t border-[#1c1c1e] py-3 flex justify-around text-gray-400">
        <NavItem icon={<Home size={20} />} label="Home" href="/" />
        <NavItem icon={<Shield size={20} />} label="Vault" href="/vault" />
        <NavItem icon={<Key size={20} />} label="Keys" href="/keys" active />
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