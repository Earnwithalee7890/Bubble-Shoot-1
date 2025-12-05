"use client";

import { useAccount } from "wagmi";
import { useCheckIn } from "@/hooks/useCheckIn";
import { useFarcaster } from "@/components/FarcasterProvider";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Activity {
    type: 'level' | 'checkin' | 'streak';
    description: string;
    timestamp: number;
}

export default function ProfilePage() {
    const { address, isConnected } = useAccount();
    const { user } = useFarcaster();
    const { streak, lastCheckIn, maxLevel, totalPoints } = useCheckIn();
    const [activities, setActivities] = useState<Activity[]>([]);

    useEffect(() => {
        // Load recent activities from localStorage
        if (typeof window !== 'undefined' && address) {
            const savedActivities = localStorage.getItem(`activities_${address}`);
            if (savedActivities) {
                setActivities(JSON.parse(savedActivities));
            } else {
                // Create initial activities based on current data
                const initialActivities: Activity[] = [];

                if (lastCheckIn) {
                    initialActivities.push({
                        type: 'checkin',
                        description: `Daily check-in completed`,
                        timestamp: lastCheckIn
                    });
                }

                if (maxLevel > 1) {
                    initialActivities.push({
                        type: 'level',
                        description: `Reached Level ${maxLevel}`,
                        timestamp: Date.now()
                    });
                }

                if (streak > 0) {
                    initialActivities.push({
                        type: 'streak',
                        description: `${streak} day streak achieved!`,
                        timestamp: Date.now()
                    });
                }

                setActivities(initialActivities);
            }
        }
    }, [address, lastCheckIn, maxLevel, streak]);

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const formatTimeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'level': return '🎮';
            case 'checkin': return '✅';
            case 'streak': return '🔥';
            default: return '📋';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden cyber-grid flex flex-col">
            {/* Header */}
            <div className="relative z-10 p-6 flex items-center bg-white/80 backdrop-blur-md border-b border-slate-200">
                <Link href="/" className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 click-scale">
                    ← Back
                </Link>
                <h1 className="text-2xl font-orbitron font-bold text-slate-800 ml-4">
                    MY PROFILE
                </h1>
            </div>

            {/* Content */}
            <div className="flex-1 relative z-10 flex flex-col items-center px-4 py-8 w-full max-w-md mx-auto overflow-y-auto">

                {/* Profile Card */}
                <div className="w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>

                    <div className="flex flex-col items-center text-center relative z-10">
                        <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-blue-500 to-purple-500 mb-4 shadow-lg">
                            <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                                {user?.pfpUrl ? (
                                    <img
                                        src={user.pfpUrl}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-5xl">👤</span>
                                )}
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 font-orbitron mb-1">
                            {user?.displayName || (isConnected && address ? formatAddress(address) : "Guest Player")}
                        </h2>

                        {user?.username && (
                            <p className="text-slate-400 font-medium mb-3">@{user.username}</p>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">
                                Base Mainnet
                            </span>
                            <span className="px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-100">
                                Player
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="w-full grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center click-scale">
                        <div className="text-3xl mb-2">💎</div>
                        <div className="text-3xl font-orbitron font-bold text-slate-800">{streak}</div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Check-in Points</div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center click-scale">
                        <div className="text-3xl mb-2">⚡</div>
                        <div className="text-3xl font-orbitron font-bold text-slate-800">{maxLevel}</div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Max Level</div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center col-span-2 click-scale">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-3xl">🔥</span>
                            <span className="text-2xl font-orbitron font-bold text-slate-800">{streak} Day Streak</span>
                        </div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                            {lastCheckIn ? `Last check-in: ${new Date(lastCheckIn).toLocaleDateString()}` : 'No check-ins yet'}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="w-full pb-10">
                    <h3 className="text-lg font-orbitron font-bold text-slate-700 mb-4 px-2">Recent Activity</h3>
                    {activities.length > 0 ? (
                        <div className="space-y-3">
                            {activities.slice(0, 5).map((activity, index) => (
                                <div key={index} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                                    <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                                    <div className="flex-1">
                                        <div className="font-medium text-slate-700">{activity.description}</div>
                                        <div className="text-xs text-slate-400">{formatTimeAgo(activity.timestamp)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-sm font-medium">
                            No recent game activity
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
