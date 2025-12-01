"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useCheckIn } from "@/hooks/useCheckIn";

export default function DailyCheckIn() {
    const { address, isConnected } = useAccount();
    const { checkIn, isLoading, canCheckIn, streak, lastCheckIn } = useCheckIn();
    const [showSuccess, setShowSuccess] = useState(false);

    const handleCheckIn = async () => {
        try {
            await checkIn();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error("Check-in failed:", error);
        }
    };

    if (!isConnected) return null;

    return (
        <div className="relative">
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md border-2 border-blue-400/40 rounded-2xl p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        Daily Check-In
                    </h3>
                    <div className="text-3xl">🎁</div>
                </div>

                {/* Streak display */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="text-4xl">🔥</div>
                    <div>
                        <div className="text-3xl font-orbitron font-bold text-orange-400">{streak} Day{streak !== 1 ? 's' : ''}</div>
                        <div className="text-sm text-blue-200">Current Streak</div>
                    </div>
                </div>

                {/* Reward info */}
                <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-purple-200">Daily Reward:</span>
                        <span className="text-2xl font-orbitron font-bold text-purple-400">3 DEGEN</span>
                    </div>
                </div>

                {/* Check-in button */}
                <button
                    onClick={handleCheckIn}
                    disabled={!canCheckIn || isLoading}
                    className={`w-full py-4 px-6 rounded-xl font-orbitron font-bold text-lg transition-all duration-300 transform ${canCheckIn && !isLoading
                            ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white hover:scale-105 hover:shadow-2xl hover:shadow-green-500/50'
                            : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                        </span>
                    ) : canCheckIn ? (
                        '✨ CHECK IN NOW'
                    ) : (
                        '✅ Checked In Today'
                    )}
                </button>

                {/* Last check-in time */}
                {lastCheckIn && (
                    <div className="mt-3 text-center text-sm text-blue-300/70">
                        Last check-in: {new Date(lastCheckIn).toLocaleDateString()}
                    </div>
                )}
            </div>

            {/* Success notification */}
            {showSuccess && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
                    <div className="bg-gradient-to-br from-green-500 to-blue-500 p-6 rounded-xl text-center animate-bounce">
                        <div className="text-4xl mb-2">🎉</div>
                        <div className="text-2xl font-orbitron font-bold text-white">+3 DEGEN</div>
                        <div className="text-sm text-green-100">Check-in successful!</div>
                    </div>
                </div>
            )}
        </div>
    );
}
