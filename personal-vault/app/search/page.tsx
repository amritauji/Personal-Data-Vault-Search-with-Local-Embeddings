"use client";

import { useState, useEffect } from "react";
import { Shield, Settings, Home, Key, User, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        const q = searchParams.get('q');
        if (q) {
            setQuery(q);
            searchNotesWithQuery(q);
        }
    }, [searchParams]);

    async function searchNotesWithQuery(searchQuery: string) {
        if (!searchQuery.trim()) return;
        setLoading(true);

        const res = await fetch("/api/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: searchQuery }),
        });

        const data = await res.json();
        setResults(data.results || data.notes || []);
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
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-2 border-[#43234A] border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-400">Searching your vault...</p>
                    </div>
                )}

                {/* Results */}
                <div className="max-w-2xl mx-auto space-y-4">
                    {results.map((note) => (
                        <div
                            key={note.id}
                            className="bg-[#111113] p-4 rounded-xl border border-[#1c1c1e] hover:bg-[#161618] transition cursor-pointer"
                        >
                            <h3 className="font-medium mb-2">{note.title}</h3>
                            <p className="text-gray-300 text-sm mb-3">{note.content}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>Relevance: {((note.similarity || note.score || 0) * 100).toFixed(1)}%</span>
                                <span>{note.type === 'vault' ? 'Vault' : 'Note'} #{note.id}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Results */}
                {!loading && results.length === 0 && query && (
                    <div className="text-center py-12">
                        <div className="bg-[#111113] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1c1c1e]">
                            <Search size={24} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No results found</h3>
                        <p className="text-gray-400">Try adjusting your search terms</p>
                    </div>
                )}
            </main>

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
