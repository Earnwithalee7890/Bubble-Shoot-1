"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import dynamic from 'next/dynamic';

const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
    ssr: false,
    loading: () => <div className="w-[800px] h-[600px] bg-[#1a1a2e] rounded-2xl flex items-center justify-center text-white font-orbitron">Loading Game Engine...</div>
});

export default function GamePage() {
    const router = useRouter();
    const { isConnected } = useAccount();
    const [currentLevel, setCurrentLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        // Load saved progress
        const savedLevel = localStorage.getItem('currentLevel');
        if (savedLevel) {
            setCurrentLevel(parseInt(savedLevel));
        }
    }, []);

    const handleLevelComplete = (levelScore: number) => {
        setScore(score + levelScore);
        const nextLevel = currentLevel + 1;
        setCurrentLevel(nextLevel);
        localStorage.setItem('currentLevel', nextLevel.toString());

        // TODO: Submit score to backend
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* HUD */}
            <div className="relative z-10 p-4 flex items-center justify-between">
                <button
                    onClick={() => router.push('/')}
                    className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 text-blue-200 font-orbitron px-6 py-2 rounded-lg transition-all backdrop-blur-sm"
                >
                    ← Back
                </button>

                <div className="flex items-center gap-6">
                    <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg px-6 py-2 backdrop-blur-sm">
                        <span className="text-blue-300 text-sm">Level: </span>
                        <span className="text-white font-orbitron font-bold text-lg">{currentLevel}</span>
                    </div>

                    <div className="bg-purple-500/20 border border-purple-400/50 rounded-lg px-6 py-2 backdrop-blur-sm">
                        <span className="text-purple-300 text-sm">Score: </span>
                        <span className="text-white font-orbitron font-bold text-lg">{score}</span>
                    </div>
                </div>

                <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 text-purple-200 font-orbitron px-6 py-2 rounded-lg transition-all backdrop-blur-sm"
                >
                    {isPaused ? '▶ Resume' : '⏸ Pause'}
                </button>
            </div>

            {/* Game Canvas */}
            <div className="relative z-10 flex items-center justify-center" style={{ height: 'calc(100vh - 80px)' }}>
                <GameCanvas
                    level={currentLevel}
                    onLevelComplete={handleLevelComplete}
                    isPaused={isPaused}
                />
            </div>

            {/* Pause Menu */}
            {isPaused && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 border-2 border-blue-400/50 rounded-2xl p-8 max-w-md w-full mx-4">
                        <h2 className="text-4xl font-orbitron font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            PAUSED
                        </h2>

                        <div className="space-y-4">
                            <button
                                onClick={() => setIsPaused(false)}
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-orbitron font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
                            >
                                ▶ Resume Game
                            </button>

                            <button
                                onClick={() => {
                                    setIsPaused(false);
                                    // TODO: Restart level
                                }}
                                className="w-full bg-purple-500/20 hover:bg-purple-500/30 border-2 border-purple-400/50 text-purple-200 font-orbitron font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300"
                            >
                                🔄 Restart Level
                            </button>

                            <button
                                onClick={() => router.push('/')}
                                className="w-full bg-purple-500/20 hover:bg-purple-500/30 border-2 border-purple-400/50 text-purple-200 font-orbitron font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300"
                            >
                                🏠 Main Menu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
