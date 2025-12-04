"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import dynamic from 'next/dynamic';

const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
    ssr: false,
    loading: () => <div className="w-full h-[600px] bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-orbitron">Loading Game Engine...</div>
});

export default function GamePage() {
    const router = useRouter();
    const { isConnected } = useAccount();
    const [currentLevel, setCurrentLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [timeLeft, setTimeLeft] = useState(180); // base 3 minutes
    const [isGameOver, setIsGameOver] = useState(false);

    // Load saved progress
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const savedLevel = localStorage.getItem('currentLevel');
        if (savedLevel) {
            setCurrentLevel(parseInt(savedLevel));
        }
    }, []);

    // Adjust timer based on level (harder after level 2)
    useEffect(() => {
        // Set initial time based on level
        const baseTime = 180; // 3 minutes for levels 1-2
        // For level 3+, reduce time by 10 seconds per level, minimum 60 seconds
        const adjusted = currentLevel > 2 ? Math.max(60, baseTime - (currentLevel - 2) * 10) : baseTime;
        setTimeLeft(adjusted);
        setIsGameOver(false);
        setIsPaused(false);
    }, [currentLevel]);

    // Timer countdown
    useEffect(() => {
        if (isPaused || isGameOver) return;

        if (timeLeft <= 0) {
            setIsGameOver(true);
            setIsPaused(true);
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [isPaused, timeLeft, isGameOver]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleLevelComplete = useCallback((levelScore: number) => {
        setScore(prevScore => prevScore + levelScore);
        setCurrentLevel(prevLevel => {
            const nextLevel = prevLevel + 1;
            if (typeof window !== 'undefined') {
                localStorage.setItem('currentLevel', nextLevel.toString());
            }
            return nextLevel;
        });
    }, []); // Empty deps since we use functional updates

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden cyber-grid flex flex-col">
            {/* HUD */}
            <div className="relative z-10 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex w-full md:w-auto justify-between items-center gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 click-scale"
                    >
                        ← Back
                    </button>

                    <button
                        onClick={() => {
                            console.log('Pause button clicked! Current state:', isPaused);
                            setIsPaused(!isPaused);
                        }}
                        className="btn-secondary px-4 py-2 text-sm md:hidden click-scale"
                    >
                        {isPaused ? '▶' : '⏸'}
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
                    <div className="bg-white/80 border border-slate-200 rounded-xl px-4 py-2 backdrop-blur-sm text-center shadow-sm">
                        <div className="text-slate-400 text-xs font-bold uppercase">Level</div>
                        <div className="text-slate-800 font-orbitron font-bold text-lg leading-none">{currentLevel}</div>
                    </div>

                    <div className={`bg-white/80 border ${timeLeft < 30 ? 'border-red-400 animate-pulse' : 'border-slate-200'} rounded-xl px-4 py-2 backdrop-blur-sm text-center shadow-sm transition-colors`}>
                        <div className={`${timeLeft < 30 ? 'text-red-400' : 'text-slate-400'} text-xs font-bold uppercase`}>Time</div>
                        <div className={`${timeLeft < 30 ? 'text-red-500' : 'text-slate-800'} font-orbitron font-bold text-lg leading-none`}>{formatTime(timeLeft)}</div>
                    </div>

                    <div className="bg-white/80 border border-slate-200 rounded-xl px-4 py-2 backdrop-blur-sm text-center shadow-sm">
                        <div className="text-slate-400 text-xs font-bold uppercase">Score</div>
                        <div className="text-slate-800 font-orbitron font-bold text-lg leading-none">{score}</div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        console.log('Pause button clicked! Current state:', isPaused);
                        setIsPaused(!isPaused);
                    }}
                    className="hidden md:block btn-secondary px-6 py-2 click-scale"
                >
                    {isPaused ? '▶ Resume' : '⏸ Pause'}
                </button>
            </div>

            {/* Game Canvas */}
            <div className="flex-1 relative z-10 flex items-center justify-center p-4" style={{ pointerEvents: isPaused ? 'none' : 'auto' }}>
                <div className="w-full max-w-4xl h-full flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50">
                    <GameCanvas
                        level={currentLevel}
                        onLevelComplete={handleLevelComplete}
                        isPaused={isPaused}
                    />
                </div>
            </div>

            {/* Game Over / Pause Menu */}
            {(isPaused || isGameOver) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm" style={{ pointerEvents: 'auto' }}>
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <h2 className="text-4xl font-orbitron font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            {isGameOver ? 'TIME UP!' : 'PAUSED'}
                        </h2>

                        <div className="space-y-4">
                            {!isGameOver && (
                                <button
                                    onClick={() => setIsPaused(false)}
                                    className="btn-primary w-full text-lg click-scale"
                                >
                                    ▶ Resume Game
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    setIsPaused(false);
                                    setIsGameOver(false);
                                    window.location.reload();
                                }}
                                className="btn-secondary w-full text-lg click-scale"
                            >
                                🔄 Restart Level
                            </button>

                            <button
                                onClick={() => router.push('/')}
                                className="btn-secondary w-full text-lg click-scale"
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
