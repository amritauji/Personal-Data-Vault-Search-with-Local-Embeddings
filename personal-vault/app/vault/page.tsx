"use client";

import { useState, useEffect } from "react";
import { Shield, Settings, Home, Key, User, Plus, FileText, CreditCard, IdCard, X, Upload, Tag } from "lucide-react";
import Link from "next/link";

export default function VaultPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    type: "document",
    category: "Recent files"
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const res = await fetch('/api/vault');
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!formData.title.trim()) return;
    
    try {
      const res = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          type: formData.type,
          category: formData.category
        })
      });
      
      if (res.ok) {
        await loadItems();
        setFormData({ title: "", content: "", tags: "", type: "document", category: "Recent files" });
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, title: file.name, type: "document" }));
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
            {items.length} items
          </span>
          <button className="p-2 bg-[#111113] rounded-xl border border-[#1c1c1e] hover:bg-[#161618] transition">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Vault</h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#43234A] text-white px-4 py-2 rounded-xl text-sm hover:bg-[#5e2c65] transition"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>

        {/* Vault Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-[#111113] p-4 rounded-xl border border-[#1c1c1e] hover:bg-[#161618] transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="bg-[#0D0D0F] p-2 rounded-lg border border-[#1c1c1e]">
                  {item.type === "document" ? (
                    <FileText size={16} className="text-gray-400" />
                  ) : item.type === "card" ? (
                    <CreditCard size={16} className="text-gray-400" />
                  ) : (
                    <IdCard size={16} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.category} • {item.lastAccessed}</p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs bg-[#0D0D0F] px-2 py-1 rounded border border-[#1c1c1e] text-gray-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-[#43234A] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your vault...</p>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-[#111113] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1c1c1e]">
              <Shield size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Your vault is empty</h3>
            <p className="text-gray-400 mb-4">Add your first item to get started</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#43234A] text-white px-4 py-2 rounded-xl text-sm hover:bg-[#5e2c65] transition"
            >
              Add Item
            </button>
          </div>
        )}
      </main>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#111113] rounded-2xl border border-[#1c1c1e] w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b border-[#1c1c1e]">
              <h3 className="font-medium">Add New Item</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-[#161618] rounded">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-[#0D0D0F] border border-[#1c1c1e] rounded-lg px-3 py-2 text-sm"
                  placeholder="Enter item title"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Upload File</label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full bg-[#0D0D0F] border border-[#1c1c1e] rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#43234A] file:text-white file:text-xs"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Content/Notes</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full bg-[#0D0D0F] border border-[#1c1c1e] rounded-lg px-3 py-2 text-sm h-20 resize-none"
                  placeholder="Add notes or content"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tags (comma separated)</label>
                <input
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full bg-[#0D0D0F] border border-[#1c1c1e] rounded-lg px-3 py-2 text-sm"
                  placeholder="finance, important, 2024"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-[#0D0D0F] border border-[#1c1c1e] rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="document">Document</option>
                    <option value="card">Card</option>
                    <option value="id">ID</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-[#0D0D0F] border border-[#1c1c1e] rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="Recent files">Recent files</option>
                    <option value="Cards">Cards</option>
                    <option value="IDs">IDs</option>
                    <option value="Passwords">Passwords</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 p-4 border-t border-[#1c1c1e]">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-[#0D0D0F] border border-[#1c1c1e] rounded-lg text-sm hover:bg-[#161618] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="flex-1 py-2 bg-[#43234A] text-white rounded-lg text-sm hover:bg-[#5e2c65] transition"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <footer className="w-full bg-[#0D0D0F] border-t border-[#1c1c1e] py-3 flex justify-around text-gray-400">
        <NavItem icon={<Home size={20} />} label="Home" href="/" />
        <NavItem icon={<Shield size={20} />} label="Vault" href="/vault" active />
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