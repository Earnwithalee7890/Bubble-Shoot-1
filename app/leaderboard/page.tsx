"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

interface LeaderboardEntry {
    rank: number;
    address: string;
    score: number;
    level: number;
    streak?: number;
}

export default function LeaderboardPage() {
    const router = useRouter();
    const { address } = useAccount();
    const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'alltime'>('alltime');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRank, setUserRank] = useState<number | null>(null);

    useEffect(() => {
        fetchLeaderboard();
    }, [timeframe]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/leaderboard?timeframe=${timeframe}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();

            // Show real data only - no fake demo data
            if (!data || data.length === 0) {
                setLeaderboard([]);
            } else {
                setLeaderboard(data);

                // Find user's rank if they're on the leaderboard
                if (address) {
                    const userEntry = data.find((e: LeaderboardEntry) =>
                        e.address.toLowerCase() === address.toLowerCase()
                    );
                    setUserRank(userEntry?.rank || null);
                }
            }
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

    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 shadow-yellow-100';
            case 2:
                return 'bg-gradient-to-r from-slate-50 to-gray-100 border-slate-300 shadow-slate-100';
            case 3:
                return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300 shadow-orange-100';
            default:
                return 'bg-white border-slate-200';
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${rank}`;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden cyber-grid flex flex-col">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

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
                        🏆 LEADERBOARD
                    </h1>

                    <div className="w-20"></div>
                </div>

                {/* Timeframe selector */}
                <div className="flex justify-center gap-2">
                    {(['daily', 'weekly', 'alltime'] as const).map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all click-scale ${timeframe === tf
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-orange-500/30'
                                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                        >
                            {tf === 'daily' ? '📅 Today' : tf === 'weekly' ? '📊 Week' : '🌟 All Time'}
                        </button>
                    ))}
                </div>
            </div>

            {/* User's Rank Card (if on leaderboard) */}
            {userRank && (
                <div className="relative z-10 mx-4 mt-4">
                    <div className="max-w-md mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <span className="font-orbitron font-bold">#{userRank}</span>
                                </div>
                                <div>
                                    <div className="text-sm opacity-80">Your Rank</div>
                                    <div className="font-bold">{formatAddress(address || '')}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl">🎮</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard */}
            <div className="flex-1 relative z-10 p-4 overflow-y-auto">
                <div className="max-w-md mx-auto space-y-3 pb-20">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-400 mt-4 font-medium">Loading rankings...</p>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="bg-white/80 border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                            <div className="text-6xl mb-4">🏆</div>
                            <p className="text-xl text-slate-600 font-bold">Leaderboard is Empty</p>
                            <p className="text-slate-400 text-sm mt-2 mb-6">Be the first player to set a record!</p>
                            <p className="text-slate-500 text-xs">Play the game and your score will appear here automatically.</p>
                            <button
                                onClick={() => router.push('/game')}
                                className="mt-4 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:from-yellow-600 hover:to-orange-600 transition-all"
                            >
                                🎮 Start Playing
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Top 3 Podium */}
                            {leaderboard.length >= 3 && (
                                <div className="flex justify-center items-end gap-2 mb-6 pt-4">
                                    {/* 2nd Place */}
                                    <div className="flex flex-col items-center">
                                        <div className="text-3xl mb-2">🥈</div>
                                        <div className="w-20 h-24 bg-gradient-to-b from-slate-200 to-slate-300 rounded-t-xl flex flex-col items-center justify-center">
                                            <div className="text-lg font-bold text-slate-700">{formatAddress(leaderboard[1].address)}</div>
                                            <div className="text-xs text-slate-500">{leaderboard[1].score.toLocaleString()} pts</div>
                                        </div>
                                    </div>
                                    {/* 1st Place */}
                                    <div className="flex flex-col items-center">
                                        <div className="text-4xl mb-2 animate-bounce">👑</div>
                                        <div className="w-24 h-32 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-t-xl flex flex-col items-center justify-center shadow-lg">
                                            <div className="text-lg font-bold text-yellow-900">{formatAddress(leaderboard[0].address)}</div>
                                            <div className="text-xs text-yellow-700">{leaderboard[0].score.toLocaleString()} pts</div>
                                        </div>
                                    </div>
                                    {/* 3rd Place */}
                                    <div className="flex flex-col items-center">
                                        <div className="text-3xl mb-2">🥉</div>
                                        <div className="w-20 h-20 bg-gradient-to-b from-orange-200 to-orange-400 rounded-t-xl flex flex-col items-center justify-center">
                                            <div className="text-lg font-bold text-orange-900">{formatAddress(leaderboard[2].address)}</div>
                                            <div className="text-xs text-orange-700">{leaderboard[2].score.toLocaleString()} pts</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Rest of the leaderboard */}
                            {leaderboard.slice(3).map((entry) => (
                                <div
                                    key={entry.rank}
                                    className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-sm border-2 ${getRankStyle(entry.rank)} ${address && entry.address.toLowerCase() === address.toLowerCase()
                                        ? 'ring-2 ring-blue-500 ring-offset-2'
                                        : ''
                                        }`}
                                >
                                    {/* Rank */}
                                    <div className="flex items-center gap-4">
                                        <div className={`text-xl font-orbitron font-bold w-12 text-center text-slate-400`}>
                                            {getRankIcon(entry.rank)}
                                        </div>

                                        {/* Address */}
                                        <div>
                                            <div className="font-bold text-slate-800">{formatAddress(entry.address)}</div>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <span className="font-bold uppercase">Lvl {entry.level}</span>
                                                {entry.streak && entry.streak > 0 && (
                                                    <span className="text-orange-500">🔥 {entry.streak}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Score */}
                                    <div className="text-right">
                                        <div className="text-xl font-orbitron font-bold text-blue-600">
                                            {entry.score.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-slate-400 font-bold uppercase">points</div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
