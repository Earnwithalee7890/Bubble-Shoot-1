"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useCheckIn } from "@/hooks/useCheckIn";

interface UserProfile {
    address: string;
    points: number;
    level: number;
    streak: number;
    last_check_in: string | null;
}

export default function ProfilePage() {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { streak: hookStreak } = useCheckIn(); // Use hook for real-time streak if available
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isConnected && address) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [address, isConnected]);

    const fetchProfile = async () => {
        if (!address) return;
        setLoading(true);
        try {
            // Reuse the check-in GET endpoint which returns user data
            const response = await fetch(`/api/check-in?address=${address}`);
            const data = await response.json();

            if (data) {
                setProfile({
                    address: address,
                    points: data.points || 0,
                    level: 1, // TODO: Store level in DB
                    streak: data.streak || 0,
                    last_check_in: data.lastCheckIn
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center p-4">
                <div className="bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-blue-500/30 text-center max-w-md w-full">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-orbitron font-bold text-white mb-4">Wallet Not Connected</h1>
                    <p className="text-blue-200 mb-8">Please connect your wallet to view your profile and stats.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-orbitron font-bold py-3 px-6 rounded-xl hover:scale-105 transition-transform"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 text-blue-200 font-orbitron px-6 py-2 rounded-lg transition-all backdrop-blur-sm"
                    >
                        ← Back
                    </button>
                    <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        MY PROFILE
                    </h1>
                    <div className="w-24"></div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {/* User Card */}
                        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-blue-400/30 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-4xl shadow-lg">
                                👤
                            </div>
                            <div className="text-center md:text-left">
                                <h2 className="text-xl font-mono text-white mb-2">{address}</h2>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    <span className="px-3 py-1 bg-blue-500/30 rounded-full text-blue-200 text-sm border border-blue-400/30">
                                        Base Mainnet
                                    </span>
                                    <span className="px-3 py-1 bg-purple-500/30 rounded-full text-purple-200 text-sm border border-purple-400/30">
                                        Player
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Points */}
                            <div className="bg-black/30 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-6 text-center transform hover:scale-105 transition-transform">
                                <div className="text-4xl mb-2">💎</div>
                                <div className="text-3xl font-orbitron font-bold text-yellow-400 mb-1">
                                    {profile?.points?.toLocaleString() || 0}
                                </div>
                                <div className="text-yellow-200/70 text-sm uppercase tracking-wider">Total Points</div>
                            </div>

                            {/* Streak */}
                            <div className="bg-black/30 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6 text-center transform hover:scale-105 transition-transform">
                                <div className="text-4xl mb-2">🔥</div>
                                <div className="text-3xl font-orbitron font-bold text-orange-400 mb-1">
                                    {profile?.streak || 0} Days
                                </div>
                                <div className="text-orange-200/70 text-sm uppercase tracking-wider">Current Streak</div>
                            </div>

                            {/* Level */}
                            <div className="bg-black/30 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 text-center transform hover:scale-105 transition-transform">
                                <div className="text-4xl mb-2">🎮</div>
                                <div className="text-3xl font-orbitron font-bold text-green-400 mb-1">
                                    {profile?.level || 1}
                                </div>
                                <div className="text-green-200/70 text-sm uppercase tracking-wider">Current Level</div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-black/20 backdrop-blur-sm border border-blue-400/20 rounded-2xl p-6">
                            <h3 className="text-xl font-orbitron font-bold text-white mb-4 flex items-center gap-2">
                                📅 Recent Activity
                            </h3>
                            <div className="space-y-3">
                                {profile?.last_check_in ? (
                                    <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-xl">
                                                ✅
                                            </div>
                                            <div>
                                                <div className="text-white font-bold">Daily Check-In</div>
                                                <div className="text-xs text-gray-400">Streak maintained!</div>
                                            </div>
                                        </div>
                                        <div className="text-sm text-blue-300">
                                            {new Date(profile.last_check_in).toLocaleDateString()}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-400 py-4">No recent activity</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
