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
            // Fallback to empty or error state, but don't use mock data anymore
            setLeaderboard([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 text-blue-200 font-orbitron px-6 py-2 rounded-lg transition-all backdrop-blur-sm"
                    >
                        ← Back
                    </button>

                    <h1 className="text-5xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">
                        🏆 LEADERBOARD
                    </h1>

                    <div className="w-24"></div>
                </div>

                {/* Timeframe selector */}
                <div className="flex justify-center gap-4 mb-8">
                    {(['daily', 'weekly', 'alltime'] as const).map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-6 py-2 rounded-lg font-orbitron font-bold transition-all ${timeframe === tf
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                : 'bg-blue-500/20 border border-blue-400/50 text-blue-200 hover:bg-blue-500/30'
                                } backdrop-blur-sm`}
                        >
                            {tf === 'daily' ? '📅 Daily' : tf === 'weekly' ? '📊 Weekly' : '🌟 All Time'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leaderboard */}
            <div className="relative z-10 px-6 pb-6">
                <div className="max-w-4xl mx-auto">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-blue-300 mt-4">Loading leaderboard...</p>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-2xl p-12 text-center backdrop-blur-sm">
                            <div className="text-6xl mb-4">🎮</div>
                            <p className="text-xl text-blue-200">No players yet. Be the first!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {leaderboard.map((entry) => (
                                <div
                                    key={entry.rank}
                                    className={`
                                        flex items-center justify-between p-6 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105
                                        ${entry.rank === 1
                                            ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400'
                                            : entry.rank === 2
                                                ? 'bg-gradient-to-r from-gray-400/30 to-gray-500/30 border-2 border-gray-400'
                                                : entry.rank === 3
                                                    ? 'bg-gradient-to-r from-orange-600/30 to-orange-700/30 border-2 border-orange-600'
                                                    : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/40'
                                        }
                                    `}
                                >
                                    {/* Rank */}
                                    <div className="flex items-center gap-4">
                                        <div className={`text-4xl font-orbitron font-bold ${entry.rank === 1 ? 'text-yellow-400' :
                                            entry.rank === 2 ? 'text-gray-300' :
                                                entry.rank === 3 ? 'text-orange-600' :
                                                    'text-blue-300'
                                            }`}>
                                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                                        </div>

                                        {/* Address */}
                                        <div>
                                            <div className="font-mono text-lg text-white">{entry.address}</div>
                                            <div className="text-sm text-blue-300">Level {entry.level}</div>
                                        </div>
                                    </div>

                                    {/* Score */}
                                    <div className="text-right">
                                        <div className="text-3xl font-orbitron font-bold text-purple-400">
                                            {entry.score.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-purple-300">points</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
