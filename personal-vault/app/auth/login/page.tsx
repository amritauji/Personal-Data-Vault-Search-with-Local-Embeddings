"use client";

import { useState } from "react";
import { Shield, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.email.split('@')[0] || 'User';
    const userData = { email: formData.email, name: name.charAt(0).toUpperCase() + name.slice(1) };
    localStorage.setItem("user", JSON.stringify(userData));
    window.location.href = "/vault";
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white flex items-center justify-center p-4">
      <div className="bg-[#111113] rounded-2xl border border-[#1c1c1e] w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="bg-[#43234A] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Welcome Back</h1>
          <p className="text-gray-400 text-lg">Sign in to access your secure vault</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Email Address</label>
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-4 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-[#0D0D0F] border border-[#1c1c1e] rounded-xl pl-12 pr-4 py-4 text-base focus:border-[#43234A] focus:ring-2 focus:ring-[#43234A]/20 transition-all outline-none"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Password</label>
            <div className="relative">
              <Lock size={20} className="absolute left-4 top-4 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full bg-[#0D0D0F] border border-[#1c1c1e] rounded-xl pl-12 pr-4 py-4 text-base focus:border-[#43234A] focus:ring-2 focus:ring-[#43234A]/20 transition-all outline-none"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#43234A] text-white py-4 rounded-xl text-lg font-semibold hover:bg-[#5e2c65] transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}