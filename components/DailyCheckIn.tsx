"use client";

import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useCheckIn } from "@/hooks/useCheckIn";

export default function DailyCheckIn() {
    const { address, isConnected } = useAccount();
    const { checkIn: syncCheckIn, isLoading: isSyncing, canCheckIn, streak, lastCheckIn } = useCheckIn();
    const { signMessageAsync } = useSignMessage();
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isSigning, setIsSigning] = useState(false);

    const handleCheckIn = async () => {
        setErrorMsg(null);
        setIsSigning(true);

        try {
            // 1. Request signature from user (Gas-free verification)
            const message = `Check-in to Bubble Shoot\nDate: ${new Date().toLocaleDateString()}\nWallet: ${address}`;
            await signMessageAsync({ message });

            // 2. If signature successful, proceed to API check-in
            await syncCheckIn();

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error: any) {
            console.error("Check-in failed:", error);
            if (error.code === 4001) {
                setErrorMsg("User rejected the signature request.");
            } else {
                setErrorMsg(error.message || "Failed to check in. Please try again.");
            }
            setTimeout(() => setErrorMsg(null), 5000);
        } finally {
            setIsSigning(false);
        }
    };

    if (!isConnected) return null;

    const isProcessing = isSigning || isSyncing;

    return (
        <div className="relative">
            <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-orbitron font-bold text-slate-800">
                        Daily Check-In
                    </h3>
                    <div className="text-3xl">🎁</div>
                </div>

                {/* Streak display */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl">🔥</div>
                    <div>
                        <div className="text-3xl font-orbitron font-bold text-orange-500">{streak} Day{streak !== 1 ? 's' : ''}</div>
                        <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">Current Streak</div>
                    </div>
                </div>

                {/* Check-in button */}
                <button
                    onClick={handleCheckIn}
                    disabled={!canCheckIn || isProcessing}
                    className={`w-full py-4 px-6 rounded-xl font-orbitron font-bold text-lg transition-all duration-300 transform click-scale ${canCheckIn && !isProcessing
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                >
                    {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            {isSigning ? 'Please Sign...' : 'Syncing...'}
                        </span>
                    ) : canCheckIn ? (
                        '✨ CHECK IN NOW'
                    ) : (
                        '✅ Checked In Today'
                    )}
                </button>

                {/* Last check-in time */}
                {lastCheckIn && (
                    <div className="mt-4 text-center text-xs text-slate-400 font-medium uppercase tracking-wide">
                        Last check-in: {new Date(lastCheckIn).toLocaleDateString()}
                    </div>
                )}
            </div>

            {/* Success notification */}
            {showSuccess && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-3xl z-10">
                    <div className="text-center animate-bounce">
                        <div className="text-5xl mb-2">🎉</div>
                        <div className="text-2xl font-orbitron font-bold text-slate-800">Check-in Verified!</div>
                        <div className="text-sm text-green-500 font-bold uppercase mt-1">Streak updated!</div>
                    </div>
                </div>
            )}

            {/* Error notification */}
            {errorMsg && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-3xl z-10">
                    <div className="text-center animate-pulse px-4">
                        <div className="text-5xl mb-2">⚠️</div>
                        <div className="text-lg font-orbitron font-bold text-red-500">{errorMsg}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
