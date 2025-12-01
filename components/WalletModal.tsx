"use client";

import { useAccount, useBalance } from "wagmi";
import { useEffect, useState } from "react";

interface WalletModalProps {
    onClose: () => void;
}

export default function WalletModal({ onClose }: WalletModalProps) {
    const { address } = useAccount();
    const { data: ethBalance } = useBalance({ address });
    const [degenBalance, setDegenBalance] = useState("0");
    const [totalRewards, setTotalRewards] = useState("0");
    const [checkInStreak, setCheckInStreak] = useState(0);

    useEffect(() => {
        // TODO: Fetch DEGEN balance and user stats from backend
        // For now, using placeholder data
    }, [address]);

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
                                <div className="text-2xl font-orbitron font-bold text-orange-400">{checkInStreak}</div>
                                <div className="text-sm text-blue-200">Check-in Streak</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-orbitron font-bold text-green-400">{totalRewards}</div>
                                <div className="text-sm text-blue-200">Total DEGEN</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-orbitron font-bold text-purple-400">0</div>
                                <div className="text-sm text-blue-200">Levels Beat</div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-xl p-6">
                        <h3 className="text-xl font-orbitron font-bold text-blue-300 mb-4">📜 Recent Activity</h3>
                        <div className="space-y-3">
                            <div className="text-center text-blue-300/60 py-8">
                                No transactions yet. Start playing to earn rewards!
                            </div>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-xl p-6">
                        <h3 className="text-xl font-orbitron font-bold text-purple-300 mb-4">🏆 Achievements</h3>
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { icon: '🎯', name: 'First Shot', locked: false },
                                { icon: '🔥', name: '7 Day Streak', locked: true },
                                { icon: '💎', name: '100 DEGEN', locked: true },
                                { icon: '👑', name: 'Level 100', locked: true },
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
