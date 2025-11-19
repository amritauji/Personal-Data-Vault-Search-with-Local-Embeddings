"use client";

import { useState, useEffect } from "react";
import { Shield, Settings, Home, Key, User, Lock, Database, Download, Trash2, LogOut } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/auth/login";
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white flex flex-col justify-between">
      {/* Top Bar */}
      <header className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="bg-[#111113] p-2 rounded-xl border border-[#1c1c1e]">
            <User size={18} />
          </div>
          <h1 className="text-lg font-medium">Profile</h1>
        </div>

        <button onClick={handleLogout} className="p-2 bg-[#111113] rounded-xl border border-[#1c1c1e] hover:bg-[#161618] transition">
          <LogOut size={18} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6">
        {/* Profile Header */}
        <div className="bg-[#111113] p-6 rounded-2xl border border-[#1c1c1e] mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#43234A] w-16 h-16 rounded-full flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.name || user?.email?.split('@')[0] || 'User'}</h2>
              <p className="text-gray-400">{user?.email || 'user@example.com'}</p>
              <p className="text-xs text-[#00E0FF] mt-1">Local encryption enabled</p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {/* Security */}
          <div className="bg-[#111113] rounded-xl border border-[#1c1c1e] overflow-hidden">
            <div className="p-4 border-b border-[#1c1c1e]">
              <h3 className="font-medium flex items-center gap-2">
                <Lock size={16} />
                Security
              </h3>
            </div>
            <div className="divide-y divide-[#1c1c1e]">
              <SettingItem title="Master Password" subtitle="Change your master password" />
              <SettingItem title="Two-Factor Auth" subtitle="Add extra security layer" />
              <SettingItem title="Biometric Unlock" subtitle="Use fingerprint or face ID" />
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-[#111113] rounded-xl border border-[#1c1c1e] overflow-hidden">
            <div className="p-4 border-b border-[#1c1c1e]">
              <h3 className="font-medium flex items-center gap-2">
                <Database size={16} />
                Data Management
              </h3>
            </div>
            <div className="divide-y divide-[#1c1c1e]">
              <SettingItem title="Export Data" subtitle="Download your vault data" icon={<Download size={16} />} />
              <SettingItem title="Import Data" subtitle="Import from other password managers" />
              <SettingItem title="Sync Settings" subtitle="Manage data synchronization" />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[#111113] rounded-xl border border-[#1c1c1e] overflow-hidden">
            <div className="p-4 border-b border-[#1c1c1e]">
              <h3 className="font-medium flex items-center gap-2 text-red-400">
                <Trash2 size={16} />
                Danger Zone
              </h3>
            </div>
            <div className="divide-y divide-[#1c1c1e]">
              <SettingItem 
                title="Clear All Data" 
                subtitle="Permanently delete all vault data" 
                textColor="text-red-400"
              />
              <SettingItem 
                title="Reset Vault" 
                subtitle="Reset vault to factory settings" 
                textColor="text-red-400"
              />
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Personal Data Vault v1.0.0</p>
          <p className="mt-1">Zero-knowledge • End-to-end encrypted</p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="w-full bg-[#0D0D0F] border-t border-[#1c1c1e] py-3 flex justify-around text-gray-400">
        <NavItem icon={<Home size={20} />} label="Home" href="/" />
        <NavItem icon={<Shield size={20} />} label="Vault" href="/vault" />
        <NavItem icon={<Key size={20} />} label="Keys" href="/keys" />
        <NavItem icon={<User size={20} />} label="Profile" href="/profile" active />
      </footer>
    </div>
  );
}

function SettingItem({
  title,
  subtitle,
  icon,
  textColor = "text-white",
}: {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  textColor?: string;
}) {
  return (
    <button className="w-full p-4 text-left hover:bg-[#161618] transition flex items-center justify-between">
      <div>
        <h4 className={`font-medium ${textColor}`}>{title}</h4>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
      {icon && <span className="text-gray-400">{icon}</span>}
    </button>
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