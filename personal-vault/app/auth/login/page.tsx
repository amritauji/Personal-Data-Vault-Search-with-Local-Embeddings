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
    <div className="min-h-screen bg-vault-bg text-white flex items-center justify-center p-4">
      <div className="bg-vault-card rounded-2xl border border-vault-border w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="bg-vault-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to access your vault</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-vault-input border border-vault-border rounded-lg pl-10 pr-3 py-2 text-sm"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full bg-vault-input border border-vault-border rounded-lg pl-10 pr-3 py-2 text-sm"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-vault-accent text-white py-2 rounded-lg hover:bg-vault-accent-hover transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}