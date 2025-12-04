"use client";

import { useAccount } from "wagmi";
import { useCheckIn } from "@/hooks/useCheckIn";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilePage() {
    const { address, isConnected } = useAccount();
    const { streak, lastCheckIn } = useCheckIn();
    const [level, setLevel] = useState(1);
    const [points, setPoints] = useState(0);

    useEffect(() => {
        // Fetch real stats from API if needed, for now using local state/checkin hook
        // In a real app, you'd fetch user profile data here
    }, [address]);

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <main className="min-h-screen bg-slate-50 relative overflow-hidden cyber-grid flex flex-col">
            {/* Header */}
            <header className="relative z-10 flex items-center p-4 md:p-6">
                <Link href="/" className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 click-scale">
                    ← Back
                </Link>
                <h1 className="text-2xl font-orbitron font-bold text-slate-800 ml-4">
                    MY PROFILE
                </h1>
            </header>

            {/* Content */}
            <div className="flex-1 relative z-10 flex flex-col items-center px-4 py-6 w-full max-w-md mx-auto">

                {/* Profile Card */}
                <div className="w-full bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-xl mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

                    <div className="flex flex-col items-center text-center relative z-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4 shadow-inner border-4 border-white">
                            <span className="text-4xl">👤</span>
                        </div>

                        <h2 className="text-xl font-bold text-slate-800 font-orbitron mb-1">
                            {isConnected && address ? formatAddress(address) : "Guest Player"}
                        </h2>

                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                Base Mainnet
                            </span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                Player
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="w-full grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center click-scale">
                        <div className="text-3xl mb-2">💎</div>
                        <div className="text-2xl font-orbitron font-bold text-slate-800">{points}</div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Points</div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center click-scale">
                        <div className="text-3xl mb-2">⚡</div>
                        <div className="text-2xl font-orbitron font-bold text-slate-800">{level}</div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Current Level</div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center col-span-2 click-scale">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-3xl">🔥</span>
                            <span className="text-2xl font-orbitron font-bold text-slate-800">{streak} Day Streak</span>
                        </div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                            {lastCheckIn ? `Last check-in: ${new Date(lastCheckIn).toLocaleDateString()}` : 'No check-ins yet'}
                        </div>
                    </div>
                </div>

                {/* Recent Activity (Placeholder) */}
                <div className="w-full">
                    <h3 className="text-lg font-orbitron font-bold text-slate-700 mb-4 px-2">Recent Activity</h3>
                    <div className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 text-center text-slate-400 text-sm">
                        No recent game activity
                    </div>
                </div>

            </div>
        </main>
    );
}
