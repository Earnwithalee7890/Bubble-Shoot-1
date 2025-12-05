"use client";

import { useAccount, useBalance } from "wagmi";
import { useEffect, useState } from "react";
import { useCheckIn } from "@/hooks/useCheckIn";

interface WalletModalProps {
    onClose: () => void;
}

interface Activity {
    type: 'level' | 'checkin' | 'streak' | 'reward';
    description: string;
    timestamp: number;
}

export default function WalletModal({ onClose }: WalletModalProps) {
    const { address } = useAccount();
    const { data: ethBalance } = useBalance({ address });
    const { streak, maxLevel, lastCheckIn } = useCheckIn();
    const [degenBalance, setDegenBalance] = useState("0");
    const [activities, setActivities] = useState<Activity[]>([]);

    useEffect(() => {
        if (address) {
            // Load activities from localStorage
            const savedActivities = localStorage.getItem(`activities_${address}`);
            if (savedActivities) {
                setActivities(JSON.parse(savedActivities));
            } else {
                // Generate activities based on current user data
                const generatedActivities: Activity[] = [];

                if (lastCheckIn) {
                    generatedActivities.push({
                        type: 'checkin',
                        description: 'Daily check-in completed',
                        timestamp: lastCheckIn
                    });
                }

                if (maxLevel > 1) {
                    generatedActivities.push({
                        type: 'level',
                        description: `Completed Level ${maxLevel - 1}`,
                        timestamp: Date.now() - 3600000 // 1 hour ago
                    });
                }

                if (streak > 2) {
                    generatedActivities.push({
                        type: 'streak',
                        description: `${streak} day streak bonus!`,
                        timestamp: Date.now() - 86400000 // 1 day ago
                    });
                }

                setActivities(generatedActivities);
            }
        }
    }, [address, lastCheckIn, maxLevel, streak]);

    const formatTimeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'level': return '🎮';
            case 'checkin': return '✅';
            case 'streak': return '🔥';
            case 'reward': return '💰';
            default: return '📋';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 border-2 border-blue-400/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90 backdrop-blur-md border-b border-blue-400/30 p-6 flex items-center justify-between">
                    <h2 className="text-3xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        💰 Wallet & Rewards
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-3xl text-blue-300 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Wallet Address */}
                    <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
                        <div className="text-sm text-blue-300 mb-1">Connected Wallet</div>
                        <div className="font-mono text-lg text-white break-all">{address}</div>
                    </div>

                    {/* Balances */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/40 rounded-xl p-6">
                            <div className="text-sm text-blue-300 mb-2">ETH Balance</div>
                            <div className="text-3xl font-orbitron font-bold text-blue-400">
                                {ethBalance ? parseFloat(ethBalance.formatted).toFixed(4) : '0.0000'}
                            </div>
                            <div className="text-xs text-blue-300/70 mt-1">Base Mainnet</div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/40 rounded-xl p-6">
                            <div className="text-sm text-purple-300 mb-2">DEGEN Balance</div>
                            <div className="text-3xl font-orbitron font-bold text-purple-400">
                                {degenBalance}
                            </div>
                            <div className="text-xs text-purple-300/70 mt-1">Earned Rewards</div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-xl p-6">
                        <h3 className="text-xl font-orbitron font-bold text-blue-300 mb-4">📊 Your Stats</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-orbitron font-bold text-orange-400">{streak}</div>
                                <div className="text-sm text-blue-200">Check-in Streak</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-orbitron font-bold text-green-400">{streak}</div>
                                <div className="text-sm text-blue-200">Daily Points</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-orbitron font-bold text-purple-400">{maxLevel}</div>
                                <div className="text-sm text-blue-200">Max Level</div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-xl p-6">
                        <h3 className="text-xl font-orbitron font-bold text-blue-300 mb-4">📜 Recent Activity</h3>
                        <div className="space-y-3">
                            {activities.length > 0 ? (
                                activities.slice(0, 5).map((activity, index) => (
                                    <div key={index} className="flex items-center gap-3 bg-blue-500/10 rounded-lg p-3">
                                        <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                                        <div className="flex-1">
                                            <div className="text-white font-medium">{activity.description}</div>
                                            <div className="text-xs text-blue-300/60">{formatTimeAgo(activity.timestamp)}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-blue-300/60 py-8">
                                    No transactions yet. Start playing to earn rewards!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-xl p-6">
                        <h3 className="text-xl font-orbitron font-bold text-purple-300 mb-4">🏆 Achievements</h3>
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { icon: '🎯', name: 'First Shot', locked: maxLevel < 1 },
                                { icon: '🔥', name: '7 Day Streak', locked: streak < 7 },
                                { icon: '💎', name: 'Level 10', locked: maxLevel < 10 },
                                { icon: '👑', name: 'Level 100', locked: maxLevel < 100 },
                            ].map((achievement, i) => (
                                <div
                                    key={i}
                                    className={`text-center p-3 rounded-lg ${achievement.locked
                                        ? 'bg-gray-700/30 opacity-50'
                                        : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/40'
                                        }`}
                                >
                                    <div className="text-3xl mb-1">{achievement.icon}</div>
                                    <div className="text-xs text-blue-200">{achievement.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-orbitron font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
