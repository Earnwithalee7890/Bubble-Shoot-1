"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import dynamic from 'next/dynamic';
import { useCheckIn } from "@/hooks/useCheckIn";

const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-400 font-orbitron">Loading...</div>
});

export default function GamePage() {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { updateMaxLevel } = useCheckIn();
    const [currentLevel, setCurrentLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [timeLeft, setTimeLeft] = useState(180);
    const [isGameOver, setIsGameOver] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const savedLevel = localStorage.getItem('currentLevel');
        if (savedLevel) setCurrentLevel(parseInt(savedLevel));
    }, []);

    useEffect(() => {
        const baseTime = 180;
        const adjusted = currentLevel > 2 ? Math.max(60, baseTime - (currentLevel - 2) * 10) : baseTime;
        setTimeLeft(adjusted);
        setIsGameOver(false);
        setIsPaused(false);
    }, [currentLevel]);

    useEffect(() => {
        if (isPaused || isGameOver) return;
        if (timeLeft <= 0) {
            setIsGameOver(true);
            setIsPaused(true);
            return;
        }
        const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [isPaused, timeLeft, isGameOver]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Save activity to localStorage
    const saveActivity = useCallback((type: 'level' | 'checkin' | 'streak', description: string) => {
        if (!address) return;

        const key = `activities_${address}`;
        const existing = localStorage.getItem(key);
        const activities = existing ? JSON.parse(existing) : [];

        activities.unshift({
            type,
            description,
            timestamp: Date.now()
        });

        // Keep only last 20 activities
        localStorage.setItem(key, JSON.stringify(activities.slice(0, 20)));
    }, [address]);

    // Submit score to leaderboard
    const submitScore = useCallback(async (newScore: number, newLevel: number) => {
        if (!address) return;

        try {
            await fetch('/api/leaderboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address,
                    score: newScore,
                    level: newLevel
                })
            });
        } catch (error) {
            console.error('Failed to submit score:', error);
        }
    }, [address]);

    const handleLevelComplete = useCallback((levelScore: number) => {
        setScore(prevScore => {
            const newScore = prevScore + levelScore;
            return newScore;
        });

        setCurrentLevel(prevLevel => {
            const nextLevel = prevLevel + 1;

            if (typeof window !== 'undefined') {
                localStorage.setItem('currentLevel', nextLevel.toString());
            }

            // Update max level in useCheckIn hook
            updateMaxLevel(nextLevel);

            // Save activity
            saveActivity('level', `Completed Level ${prevLevel} with ${levelScore} points`);

            // Submit to leaderboard
            submitScore(score + levelScore, nextLevel);

            return nextLevel;
        });
    }, [updateMaxLevel, saveActivity, submitScore, score]);

    return (
        <div className="h-screen bg-slate-900 relative overflow-hidden flex flex-col">
            {/* Top HUD */}
            <div className="bg-slate-800/80 backdrop-blur-md p-3 flex justify-between items-center z-20 shadow-lg border-b border-slate-700">
                <div className="flex flex-col items-center w-1/3">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Level</span>
                    <span className="text-white font-orbitron font-bold text-xl">{currentLevel}</span>
                </div>
                <div className="flex flex-col items-center w-1/3 border-x border-slate-700">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${timeLeft < 30 ? 'text-red-400' : 'text-slate-400'}`}>Time</span>
                    <span className={`font-orbitron font-bold text-xl ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{formatTime(timeLeft)}</span>
                </div>
                <div className="flex flex-col items-center w-1/3">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Score</span>
                    <span className="text-white font-orbitron font-bold text-xl">{score}</span>
                </div>
            </div>

            {/* Game Area */}
            <div className="flex-1 relative w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden">
                <GameCanvas
                    level={currentLevel}
                    onLevelComplete={handleLevelComplete}
                    isPaused={isPaused}
                />
            </div>

            {/* Bottom Footer Controls */}
            <div className="bg-slate-800/90 backdrop-blur-md p-4 flex justify-between items-center z-20 border-t border-slate-700 pb-8">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-bold transition-all active:scale-95"
                >
                    <span>←</span> Back
                </button>

                <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                >
                    {isPaused ? '▶ Resume' : '⏸ Pause'}
                </button>
            </div>

            {/* Pause/Game Over Modal */}
            {(isPaused || isGameOver) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-600 rounded-3xl p-8 max-w-xs w-full mx-4 shadow-2xl transform scale-100 transition-all">
                        <h2 className="text-3xl font-orbitron font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            {isGameOver ? 'TIME UP!' : 'PAUSED'}
                        </h2>

                        <div className="space-y-3">
                            {!isGameOver && (
                                <button
                                    onClick={() => setIsPaused(false)}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold text-lg shadow-lg active:scale-95 transition-all"
                                >
                                    ▶ Resume
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    setIsPaused(false);
                                    setIsGameOver(false);
                                    window.location.reload();
                                }}
                                className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-bold text-lg active:scale-95 transition-all"
                            >
                                🔄 Restart
                            </button>

                            <button
                                onClick={() => router.push('/')}
                                className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-bold text-lg active:scale-95 transition-all"
                            >
                                🏠 Menu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
