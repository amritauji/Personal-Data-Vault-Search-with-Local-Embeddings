"use client";

import { useState, useEffect } from "react";
import { Shield, Settings, Home, Key, User, Search, ArrowLeft, Eye, FileText, CreditCard, IdCard, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [popularTags, setPopularTags] = useState<string[]>([]);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        const q = searchParams.get('q');
        if (q) {
            setQuery(q);
            searchNotesWithQuery(q);
        }
        loadPopularTags();
    }, [searchParams]);

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
            // Get 5 random unique tags
            const uniqueTags = [...new Set(allTags)];
            const randomTags = uniqueTags.sort(() => 0.5 - Math.random()).slice(0, 5);
            setPopularTags(randomTags);
        } catch (error) {
            console.error('Failed to load tags:', error);
        }
    };

    async function searchNotesWithQuery(searchQuery: string) {
        if (!searchQuery.trim()) return;
        setLoading(true);

        const res = await fetch("/api/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: searchQuery }),
        });

        const data = await res.json();
        // Limit to top 3 results and sort by similarity
        const sortedResults = (data.results || data.notes || [])
            .sort((a, b) => (b.similarity || b.score || 0) - (a.similarity || a.score || 0))
            .slice(0, 3);
        setResults(sortedResults);
        setLoading(false);
    }

    async function searchNotes() {
        searchNotesWithQuery(query);
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            searchNotes();
        }
    };

    const handleTagClick = (tag: string) => {
        setQuery(tag);
        searchNotesWithQuery(tag);
    };

    const handleView = (item) => {
        setSelectedItem(item);
        setShowViewModal(true);
    };

    return (
        <div className="min-h-screen bg-[#0B0B0D] text-white flex flex-col justify-between">
            {/* Top Bar */}
            <header className="flex justify-between items-center px-6 py-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="p-2 bg-[#111113] rounded-xl border border-[#1c1c1e] hover:bg-[#161618] transition">
                        <ArrowLeft size={18} />
                    </Link>
                    <h1 className="text-lg font-medium">Search</h1>
                </div>

                <button className="p-2 bg-[#111113] rounded-xl border border-[#1c1c1e] hover:bg-[#161618] transition">
                    <Settings size={18} />
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-6">
                {/* Search Box */}
                <div className="bg-[#111113] w-full max-w-2xl mx-auto rounded-2xl p-6 border border-[#1c1c1e] mb-6">
                    <div className="flex items-center gap-3 bg-[#0D0D0F] px-4 py-3 rounded-xl border border-[#1c1c1e]">
                        <Search size={18} className="text-gray-400" />
                        <input
                            placeholder="Search across your vault..."
                            className="bg-transparent flex-1 outline-none text-sm text-gray-200 placeholder:text-gray-500"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button
                            onClick={searchNotes}
                            className="px-4 py-2 bg-[#43234A] text-white rounded-lg text-sm hover:bg-[#5e2c65] transition"
                        >
                            Search
                        </button>
                    </div>
                    
                    {/* Popular Tags */}
                    {popularTags.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-400 mb-2">Popular tags:</p>
                            <div className="flex flex-wrap gap-2">
                                {popularTags.map((tag, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleTagClick(tag)}
                                        className="px-3 py-1 bg-[#0D0D0F] border border-[#1c1c1e] rounded-lg text-xs text-gray-300 hover:border-[#43234A] hover:text-[#00E0FF] transition"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-2 border-[#43234A] border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-400">Searching your vault...</p>
                    </div>
                )}

                {/* Results Header */}
                {results.length > 0 && (
                    <div className="max-w-2xl mx-auto mb-4">
                        <h3 className="text-lg font-medium">Top {results.length} Results</h3>
                        <p className="text-sm text-gray-400">Showing most accurate matches</p>
                    </div>
                )}

                {/* Results */}
                <div className="max-w-2xl mx-auto space-y-4">
                    {results.map((note, index) => {
                        const accuracy = ((note.similarity || note.score || 0) * 100);
                        const isHighAccuracy = accuracy >= 70;
                        return (
                            <div
                                key={note.id}
                                className={`bg-[#111113] p-4 rounded-xl border transition cursor-pointer ${
                                    isHighAccuracy 
                                        ? 'border-[#43234A]/50 bg-[#43234A]/5' 
                                        : 'border-[#1c1c1e] hover:bg-[#161618]'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-medium">{note.title}</h3>
                                            {isHighAccuracy && (
                                                <span className="px-2 py-1 bg-[#43234A]/20 border border-[#43234A]/30 rounded text-xs text-[#00E0FF]">
                                                    High Match
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                                            {note.content?.substring(0, 150)}{note.content?.length > 150 ? '...' : ''}
                                        </p>
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    accuracy >= 90 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                    accuracy >= 70 ? 'bg-[#43234A]/20 text-[#00E0FF] border border-[#43234A]/30' :
                                                    accuracy >= 50 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                    'bg-red-500/20 text-red-400 border border-red-500/30'
                                                }`}>
                                                    {accuracy.toFixed(1)}% Match
                                                </span>
                                            </div>
                                            <span>{note.type === 'vault' ? 'Vault' : 'Note'} #{note.id}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleView(note);
                                        }}
                                        className="ml-3 p-2 bg-[#0D0D0F] rounded-lg border border-[#1c1c1e] hover:bg-[#161618] transition"
                                    >
                                        <Eye size={14} className="text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* No Results */}
                {!loading && results.length === 0 && query && (
                    <div className="text-center py-12">
                        <div className="bg-[#111113] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1c1c1e]">
                            <Search size={24} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No results found</h3>
                        <p className="text-gray-400 mb-4">Try adjusting your search terms or use popular tags</p>
                        {popularTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-center">
                                {popularTags.map((tag, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleTagClick(tag)}
                                        className="px-3 py-1 bg-[#0D0D0F] border border-[#1c1c1e] rounded-lg text-xs text-gray-300 hover:border-[#43234A] hover:text-[#00E0FF] transition"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* View Item Modal */}
            {showViewModal && selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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
                                    <label className="block text-sm text-gray-400 mb-2">Match Accuracy</label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-[#0D0D0F] rounded-full h-2">
                                            <div 
                                                className="bg-[#43234A] h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${((selectedItem.similarity || selectedItem.score || 0) * 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-[#00E0FF] font-medium">
                                            {((selectedItem.similarity || selectedItem.score || 0) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
