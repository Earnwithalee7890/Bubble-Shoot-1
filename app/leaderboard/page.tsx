"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface LeaderboardEntry {
    rank: number;
    address: string;
    score: number;
    level: number;
}

export default function LeaderboardPage() {
    const router = useRouter();
    const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'alltime'>('alltime');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, [timeframe]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/leaderboard?timeframe=${timeframe}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setLeaderboard(data);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            setLeaderboard([]);
        } finally {
            setLoading(false);
        }
    };

    const formatAddress = (addr: string) => {
        if (!addr) return 'Unknown';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden cyber-grid flex flex-col">
            {/* Header */}
            <div className="relative z-10 p-6 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.push('/')}
                        className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 click-scale"
                    >
                        ← Back
                    </button>

                    <h1 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
                        LEADERBOARD
                    </h1>

                    <div className="w-20"></div>
                </div>

                {/* Timeframe selector */}
                <div className="flex justify-center gap-2">
                    {(['daily', 'weekly', 'alltime'] as const).map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all click-scale ${timeframe === tf
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            {tf === 'daily' ? '📅 Daily' : tf === 'weekly' ? '📊 Weekly' : '🌟 All Time'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leaderboard */}
            <div className="flex-1 relative z-10 p-4 overflow-y-auto">
                <div className="max-w-md mx-auto space-y-3 pb-20">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-400 mt-4 font-medium">Loading scores...</p>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="bg-white/80 border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                            <div className="text-6xl mb-4">🎮</div>
                            <p className="text-xl text-slate-600 font-bold">No players yet</p>
                            <p className="text-slate-400 text-sm mt-2">Be the first to claim the throne!</p>
                        </div>
                    ) : (
                        leaderboard.map((entry) => (
                            <div
                                key={entry.rank}
                                className={`
                                    flex items-center justify-between p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-sm border
                                    ${entry.rank === 1
                                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                                        : entry.rank === 2
                                            ? 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200'
                                            : entry.rank === 3
                                                ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'
                                                : 'bg-white border-slate-100'
                                    }
                                `}
                            >
                                {/* Rank */}
                                <div className="flex items-center gap-4">
                                    <div className={`text-2xl font-orbitron font-bold w-10 text-center ${entry.rank === 1 ? 'text-yellow-500' :
                                        entry.rank === 2 ? 'text-slate-400' :
                                            entry.rank === 3 ? 'text-orange-500' :
                                                'text-slate-300'
                                        }`}>
                                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <div className="font-bold text-slate-800">{formatAddress(entry.address)}</div>
                                        <div className="text-xs text-slate-400 font-bold uppercase">Level {entry.level}</div>
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="text-right">
                                    <div className="text-xl font-orbitron font-bold text-blue-600">
                                        {entry.score.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-slate-400 font-bold uppercase">pts</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
