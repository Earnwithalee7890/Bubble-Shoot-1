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
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
            {/* Animated background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 flex justify-between items-center p-6">
                <div className="flex items-center gap-4">
                    <img src="/images/logo.png" alt="Bubble Shot" className="w-12 h-12 object-contain" />
                    <h1 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        BUBBLE SHOT
                    </h1>
                </div>
                <WalletConnect />
            </header>

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-48 h-48 md:w-64 md:h-64 mx-auto mb-4">
                        <img
                            src="/images/logo.png"
                            alt="Bubble Shot Logo"
                            className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                        />
                    </div>
                    <p className="text-xl md:text-2xl text-blue-200 font-inter">
                        Crypto Bubble Shooter • Daily Check-In Streaks
                    </p>
                </div>

                {/* Main menu buttons */}
                <div className="flex flex-col gap-4 w-full max-w-md mb-8">
                    <button
                        onClick={() => {
                            console.log("Play button clicked");
                            router.push("/game");
                        }}
                        className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-orbitron font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 text-center relative z-50 cursor-pointer"
                    >
                        🎮 PLAY NOW
                    </button>

                    <Link
                        href="/levels"
                        className="block w-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border-2 border-purple-400/50 text-purple-200 font-orbitron font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm text-center"
                    >
                        📊 LEVELS
                    </Link>

                    <button
                        onClick={() => setShowWalletModal(true)}
                        disabled={!isConnected}
                        className="w-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border-2 border-purple-400/50 text-purple-200 font-orbitron font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        💰 WALLET & REWARDS
                    </button>

                    <Link
                        href="/profile"
                        className="block w-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border-2 border-purple-400/50 text-purple-200 font-orbitron font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm text-center"
                    >
                        👤 PROFILE
                    </Link>

                    <Link
                        href="/leaderboard"
                        className="block w-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border-2 border-purple-400/50 text-purple-200 font-orbitron font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm text-center"
                    >
                        🏆 LEADERBOARD
                    </Link>
                </div>

                {/* Daily Check-In Section */}
                {isConnected && (
                    <div className="w-full max-w-md">
                        <DailyCheckIn />
                    </div>
                )}

                {/* Stats */}
                {isConnected && (
                    <div className="grid grid-cols-3 gap-4 w-full max-w-md mt-8">
                        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-400/30 rounded-lg p-4 text-center">
                            <div className="text-2xl font-orbitron font-bold text-blue-400">0</div>
                            <div className="text-sm text-blue-200">Level</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-400/30 rounded-lg p-4 text-center">
                            <div className="text-2xl font-orbitron font-bold text-purple-400">0</div>
                            <div className="text-sm text-purple-200">Points</div>
                        </div>
                        <div className="bg-gradient-to-br from-pink-500/10 to-blue-500/10 backdrop-blur-sm border border-pink-400/30 rounded-lg p-4 text-center">
                            <div className="text-2xl font-orbitron font-bold text-pink-400">0</div>
                            <div className="text-sm text-pink-200">Streak</div>
                        </div>
                    </div>
                )}

                {/* Connect wallet prompt */}
                {!isConnected && (
                    <div className="mt-8 text-center">
                        <p className="text-blue-200 mb-4">Connect your wallet to start playing and track your daily check-in streak!</p>
                    </div>
                )}
            </div>

            {/* Wallet Modal */}
            {showWalletModal && (
                <WalletModal onClose={() => setShowWalletModal(false)} />
            )}

            {/* Footer */}
            <footer className="relative z-10 text-center py-6 text-blue-300/60 text-sm">
                <p>Powered by Base Mainnet • Built with ❤️ for the crypto community</p>
            </footer>
        </main>
    );
}
