"use client";

import { useAccount, useBalance } from "wagmi";
import { useEffect, useState } from "react";

interface WalletModalProps {
    onClose: () => void;
}

interface Transaction {
    type: 'send' | 'receive' | 'reward' | 'game';
    amount: string;
    token: string;
    description: string;
    timestamp: number;
    hash?: string;
}

export default function WalletModal({ onClose }: WalletModalProps) {
    const { address } = useAccount();
    const { data: ethBalance } = useBalance({ address });
    const [degenBalance] = useState("0");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (address) {
            // Simulate loading wallet transactions
            setIsLoading(true);
            setTimeout(() => {
                // In production, fetch real transactions from blockchain/API
                const mockTransactions: Transaction[] = [
                    {
                        type: 'receive',
                        amount: '0.001',
                        token: 'ETH',
                        description: 'Received from friend',
                        timestamp: Date.now() - 86400000,
                    },
                    {
                        type: 'game',
                        amount: '10',
                        token: 'DEGEN',
                        description: 'Level 5 completion reward',
                        timestamp: Date.now() - 172800000,
                    },
                    {
                        type: 'reward',
                        amount: '5',
                        token: 'DEGEN',
                        description: 'Daily check-in bonus',
                        timestamp: Date.now() - 259200000,
                    },
                ];
                setTransactions(mockTransactions);
                setIsLoading(false);
            }, 800);
        }
    }, [address]);

    const formatTimeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'send': return '↗️';
            case 'receive': return '↙️';
            case 'reward': return '🎁';
            case 'game': return '🎮';
            default: return '💱';
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'send': return 'text-red-400';
            case 'receive': return 'text-green-400';
            case 'reward': return 'text-yellow-400';
            case 'game': return 'text-purple-400';
            default: return 'text-blue-400';
        }
    };

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700/50 p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-xl">💳</span>
                        </div>
                        <h2 className="text-xl font-orbitron font-bold text-white">
                            My Wallet
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {/* Wallet Address Card */}
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-slate-700/50 rounded-2xl p-4">
                        <div className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-bold">Wallet Address</div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 font-mono text-sm text-slate-300 truncate">{address}</div>
                            <button
                                onClick={copyAddress}
                                className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-xs text-slate-300 hover:text-white transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    {/* Balance Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-4 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
                            <div className="relative z-10">
                                <div className="text-xs text-blue-300 uppercase tracking-wider font-bold mb-1">ETH</div>
                                <div className="text-2xl font-orbitron font-bold text-white">
                                    {ethBalance ? parseFloat(ethBalance.formatted).toFixed(4) : '0.0000'}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Base Mainnet</div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 rounded-2xl p-4 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-500/10 rounded-full blur-xl"></div>
                            <div className="relative z-10">
                                <div className="text-xs text-purple-300 uppercase tracking-wider font-bold mb-1">DEGEN</div>
                                <div className="text-2xl font-orbitron font-bold text-white">
                                    {degenBalance}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Rewards</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-3 gap-3">
                        <button className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl transition-colors group">
                            <div className="w-10 h-10 bg-green-500/20 group-hover:bg-green-500/30 rounded-xl flex items-center justify-center transition-colors">
                                <span className="text-lg">↙️</span>
                            </div>
                            <span className="text-xs text-slate-400 group-hover:text-white transition-colors font-medium">Receive</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl transition-colors group">
                            <div className="w-10 h-10 bg-blue-500/20 group-hover:bg-blue-500/30 rounded-xl flex items-center justify-center transition-colors">
                                <span className="text-lg">↗️</span>
                            </div>
                            <span className="text-xs text-slate-400 group-hover:text-white transition-colors font-medium">Send</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl transition-colors group">
                            <div className="w-10 h-10 bg-purple-500/20 group-hover:bg-purple-500/30 rounded-xl flex items-center justify-center transition-colors">
                                <span className="text-lg">🔄</span>
                            </div>
                            <span className="text-xs text-slate-400 group-hover:text-white transition-colors font-medium">Swap</span>
                        </button>
                    </div>

                    {/* Recent Transactions */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Activity</h3>
                        <div className="space-y-2">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                </div>
                            ) : transactions.length > 0 ? (
                                transactions.map((tx, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'receive' ? 'bg-green-500/20' :
                                                tx.type === 'send' ? 'bg-red-500/20' :
                                                    tx.type === 'reward' ? 'bg-yellow-500/20' :
                                                        'bg-purple-500/20'
                                            }`}>
                                            <span className="text-lg">{getTransactionIcon(tx.type)}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-white truncate">{tx.description}</div>
                                            <div className="text-xs text-slate-500">{formatTimeAgo(tx.timestamp)}</div>
                                        </div>
                                        <div className={`text-right ${getTransactionColor(tx.type)}`}>
                                            <div className="text-sm font-bold">
                                                {tx.type === 'send' ? '-' : '+'}{tx.amount}
                                            </div>
                                            <div className="text-xs text-slate-500">{tx.token}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <div className="text-3xl mb-2">📭</div>
                                    <div className="text-sm">No transactions yet</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
