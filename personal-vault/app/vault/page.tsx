"use client";

import { useState, useEffect } from "react";
import { Shield, Settings, Home, Key, User, Plus, FileText, CreditCard, IdCard, X, Upload, Tag, Eye, Trash2 } from "lucide-react";
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
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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
          tags: selectedTags.length > 0 ? selectedTags : formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          type: formData.type,
          category: formData.category
        })
      });
      
      if (res.ok) {
        await loadItems();
        setFormData({ title: "", content: "", tags: "", type: "document", category: "Recent files" });
        setSuggestedTags([]);
        setSelectedTags([]);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const generateTags = async () => {
    if (!formData.title && !formData.content) return;
    
    try {
      const res = await fetch('/api/generate-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.title, content: formData.content })
      });
      const data = await res.json();
      setSuggestedTags(data.tags || []);
    } catch (error) {
      console.error('Failed to generate tags:', error);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/vault?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadItems();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
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
                  <p className="text-sm text-gray-400">{item.category} • {new Date(item.createdAt).toLocaleDateString()}</p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs bg-vault-input px-2 py-1 rounded border border-vault-border text-gray-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(item);
                    }}
                    className="p-2 bg-vault-input rounded-lg border border-vault-border hover:bg-vault-hover transition"
                  >
                    <Eye size={14} className="text-gray-400" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(item.id);
                    }}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition"
                  >
                    <Trash2 size={14} />
                  </button>
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
                  onBlur={generateTags}
                  className="w-full bg-vault-input border border-vault-border rounded-lg px-3 py-2 text-sm h-20 resize-none"
                  placeholder="Add notes or content"
                />
              </div>
              
              {suggestedTags.length > 0 && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Suggested Tags (click to select)</label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((tag, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-lg text-xs border transition ${
                          selectedTags.includes(tag)
                            ? 'bg-vault-accent border-vault-accent text-white'
                            : 'bg-vault-input border-vault-border text-gray-400 hover:border-vault-accent'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedTags.length === 0 && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tags (comma separated)</label>
                  <input
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full bg-vault-input border border-vault-border rounded-lg px-3 py-2 text-sm"
                    placeholder="finance, important, 2024"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-vault-input border border-vault-border rounded-lg px-3 py-2 text-sm"
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
                    className="w-full bg-vault-input border border-vault-border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="Recent files">Recent files</option>
                    <option value="Cards">Cards</option>
                    <option value="IDs">IDs</option>
                    <option value="Passwords">Passwords</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 p-4 border-t border-vault-border">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-vault-input border border-vault-border rounded-lg text-sm hover:bg-vault-hover transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="flex-1 py-2 bg-vault-accent text-white rounded-lg text-sm hover:bg-vault-accent-hover transition"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Item Modal */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#111113] rounded-2xl border border-[#1c1c1e] w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-[#1c1c1e]">
              <h3 className="font-medium text-lg">{selectedItem.title}</h3>
              <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-[#161618] rounded">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Type</label>
                  <div className="flex items-center gap-2">
                    {selectedItem.type === "document" ? (
                      <FileText size={16} className="text-gray-400" />
                    ) : selectedItem.type === "card" ? (
                      <CreditCard size={16} className="text-gray-400" />
                    ) : (
                      <IdCard size={16} className="text-gray-400" />
                    )}
                    <span className="capitalize">{selectedItem.type}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category</label>
                  <p className="text-gray-200">{selectedItem.category}</p>
                </div>
                
                {selectedItem.content && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Content</label>
                    <div className="bg-[#0D0D0F] border border-[#1c1c1e] rounded-lg p-4">
                      <p className="text-gray-200 whitespace-pre-wrap">{selectedItem.content}</p>
                    </div>
                  </div>
                )}
                
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-[#43234A]/20 border border-[#43234A]/30 rounded-lg text-xs text-[#00E0FF]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Created</label>
                  <p className="text-gray-200">{new Date(selectedItem.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#111113] rounded-2xl border border-[#1c1c1e] w-full max-w-sm p-6">
            <h3 className="text-lg font-medium mb-4">Delete Item</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 bg-[#0D0D0F] border border-[#1c1c1e] rounded-lg text-sm hover:bg-[#161618] transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
              >
                Delete
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