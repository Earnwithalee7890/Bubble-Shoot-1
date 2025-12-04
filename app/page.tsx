"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { WalletConnect } from "@/components/WalletConnect";
import DailyCheckIn from "@/components/DailyCheckIn";
import WalletModal from "@/components/WalletModal";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const [showWalletModal, setShowWalletModal] = useState(false);

    return (
        <main className="min-h-screen bg-slate-50 relative overflow-hidden cyber-grid">
            {/* Background Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 -right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 flex flex-col md:flex-row justify-between items-center p-4 md:p-6 gap-4">
                <div className="flex items-center gap-3">
                    <img src="/images/logo.png" alt="Bubble Shot" className="w-10 h-10 object-contain drop-shadow-md" />
                    <h1 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        BUBBLE SHOT
                    </h1>
                </div>
                <div className="w-full md:w-auto flex justify-center">
                    <WalletConnect />
                </div>
            </header>

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-4 py-8">
                {/* Logo & Title */}
                <div className="text-center mb-8 md:mb-12">
                    <div className="w-40 h-40 md:w-64 md:h-64 mx-auto mb-6 animate-float">
                        <img
                            src="/images/logo.png"
                            alt="Bubble Shot Logo"
                            className="w-full h-full object-contain drop-shadow-xl"
                        />
                    </div>
                    <p className="text-lg md:text-xl text-slate-500 font-inter font-medium">
                        Crypto Bubble Shooter • Daily Rewards
                    </p>
                </div>

                {/* Main menu buttons */}
                <div className="flex flex-col gap-4 w-full max-w-sm mb-10">
                    <button
                        onClick={() => router.push("/game")}
                        className="btn-primary w-full text-lg py-4 shadow-blue-500/30 hover:shadow-blue-500/50 click-scale"
                    >
                        🎮 PLAY NOW
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                        <Link
                            href="/levels"
                            className="btn-secondary flex items-center justify-center text-center py-4 click-scale"
                        >
                            📊 LEVELS
                        </Link>

                        <Link
                            href="/leaderboard"
                            className="btn-secondary flex items-center justify-center text-center py-4 click-scale"
                        >
                            🏆 RANK
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setShowWalletModal(true)}
                            disabled={!isConnected}
                            className="btn-secondary flex items-center justify-center text-center py-4 click-scale disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            💰 WALLET
                        </button>

                        <Link
                            href="/profile"
                            className="btn-secondary flex items-center justify-center text-center py-4 click-scale"
                        >
                            👤 PROFILE
                        </Link>
                    </div>
                </div>

                {/* Daily Check-In Section */}
                {isConnected && (
                    <div className="w-full max-w-sm mb-8">
                        <DailyCheckIn />
                    </div>
                )}

                {/* Stats */}
                {isConnected && (
                    <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
                        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
                            <div className="text-2xl font-orbitron font-bold text-blue-500">1</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Level</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
                            <div className="text-2xl font-orbitron font-bold text-purple-500">0</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Points</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
                            <div className="text-2xl font-orbitron font-bold text-pink-500">0</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Streak</div>
                        </div>
                    </div>
                )}

                {/* Connect wallet prompt */}
                {!isConnected && (
                    <div className="mt-4 text-center">
                        <p className="text-slate-400 text-sm">Connect your wallet to start playing!</p>
                    </div>
                )}
            </div>

            {/* Wallet Modal */}
            {showWalletModal && (
                <WalletModal onClose={() => setShowWalletModal(false)} />
            )}

            {/* Footer */}
            <footer className="relative z-10 text-center py-6 text-slate-400 text-xs">
                <p>Powered by Base Mainnet</p>
            </footer>
        </main>
    );
}
