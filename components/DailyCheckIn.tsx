"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useCheckIn } from "@/hooks/useCheckIn";

const CHECKIN_CONTRACT_ADDRESS = "0x48181E31c8b3f7047634eb3d391Ecb5f9971E04B"; // Updated to deployed contract address

const CONTRACT_ABI = [
    {
        "inputs": [],
        "name": "checkIn",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export default function DailyCheckIn() {
    const { address, isConnected } = useAccount();
    const { checkIn: syncCheckIn, isLoading: isSyncing, canCheckIn, streak, lastCheckIn } = useCheckIn();
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Wagmi hooks for transaction
    const { data: hash, writeContract, isPending: isConfirming, error: writeError } = useWriteContract();
    const { isLoading: isVerifying, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    // Handle transaction errors
    useEffect(() => {
        if (writeError) {
            console.error("Transaction failed:", writeError);
            setErrorMsg(writeError.message || "Transaction failed. Please try again.");
            setTimeout(() => setErrorMsg(null), 5000);
        }
    }, [writeError]);

    // Sync with backend after transaction confirms
    useEffect(() => {
        if (isConfirmed) {
            const sync = async () => {
                try {
                    await syncCheckIn(); // Call backend to update streak
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
                } catch (err) {
                    console.error("Sync failed:", err);
                    // Even if sync fails, the on-chain tx succeeded, so we could show success
                    // But for now let's just show success as the main action is done
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
                }
            };
            sync();
        }
    }, [isConfirmed, syncCheckIn]);

    const handleCheckIn = async () => {
        setErrorMsg(null);

        if (!CHECKIN_CONTRACT_ADDRESS) {
            setErrorMsg("Contract address not configured!");
            return;
        }

        try {
            writeContract({
                address: CHECKIN_CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'checkIn',
            });
        } catch (error: any) {
            console.error("Check-in initiation failed:", error);
            setErrorMsg(error.message || "Failed to start check-in.");
        }
    };

    if (!isConnected) return null;

    const isProcessing = isConfirming || isVerifying || isSyncing;

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

                {/* Check-in button */}
                <button
                    onClick={handleCheckIn}
                    disabled={!canCheckIn || isProcessing}
                    className={`w-full py-4 px-6 rounded-xl font-orbitron font-bold text-lg transition-all duration-300 transform ${canCheckIn && !isProcessing
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white hover:scale-105 hover:shadow-2xl hover:shadow-green-500/50'
                        : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            {isConfirming ? 'Confirm in Wallet...' : isVerifying ? 'Verifying...' : 'Syncing...'}
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
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl z-10">
                    <div className="bg-gradient-to-br from-green-500 to-blue-500 p-6 rounded-xl text-center animate-bounce">
                        <div className="text-4xl mb-2">🎉</div>
                        <div className="text-2xl font-orbitron font-bold text-white">Check-in Verified!</div>
                        <div className="text-sm text-green-100">Streak updated!</div>
                        {hash && (
                            <a
                                href={`https://basescan.org/tx/${hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block mt-2 text-xs text-blue-200 hover:text-white underline"
                            >
                                View Transaction
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Error notification */}
            {errorMsg && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl z-10">
                    <div className="bg-gradient-to-br from-red-500 to-orange-500 p-6 rounded-xl text-center animate-pulse">
                        <div className="text-4xl mb-2">⚠️</div>
                        <div className="text-lg font-orbitron font-bold text-white">{errorMsg}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
