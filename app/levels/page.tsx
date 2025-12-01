"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function LevelsPage() {
    const router = useRouter();
    const [currentLevel, setCurrentLevel] = useState(1);
    const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());

    useEffect(() => {
        const savedLevel = localStorage.getItem('currentLevel');
        if (savedLevel) {
            setCurrentLevel(parseInt(savedLevel));
        }

        // TODO: Load completed levels from backend
        const completed = localStorage.getItem('completedLevels');
        if (completed) {
            setCompletedLevels(new Set(JSON.parse(completed)));
        }
    }, []);

    const playLevel = (level: number) => {
        if (level <= currentLevel) {
            localStorage.setItem('selectedLevel', level.toString());
            router.push('/game');
        }
    };

    const renderLevelGrid = () => {
        const levels = [];
        for (let i = 1; i <= 1000; i++) {
            const isCompleted = completedLevels.has(i);
            const isLocked = i > currentLevel;
            const isCurrent = i === currentLevel;

            levels.push(
                <button
                    key={i}
                    onClick={() => playLevel(i)}
                    disabled={isLocked}
                    className={`
                        relative aspect-square rounded-lg font-orbitron font-bold text-lg transition-all duration-300
                        ${isLocked
                            ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                            : isCompleted
                                ? 'bg-gradient-to-br from-green-500/30 to-blue-500/30 border-2 border-green-400/50 text-green-300 hover:scale-110'
                                : isCurrent
                                    ? 'bg-gradient-to-br from-blue-500/40 to-purple-500/40 border-2 border-blue-400 text-white animate-pulse hover:scale-110'
                                    : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-400/50 text-blue-200 hover:scale-110 hover:border-purple-400'
                        }
                    `}
                >
                    {isLocked ? '🔒' : i}
                    {isCompleted && (
                        <div className="absolute top-1 right-1 text-yellow-400 text-xs">
                            ⭐⭐⭐
                        </div>
                    )}
                </button>
            );
        }
        return levels;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 text-blue-200 font-orbitron px-6 py-2 rounded-lg transition-all backdrop-blur-sm"
                    >
                        ← Back
                    </button>

                    <h1 className="text-4xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        LEVEL SELECT
                    </h1>

                    <div className="bg-purple-500/20 border border-purple-400/50 rounded-lg px-6 py-2 backdrop-blur-sm">
                        <span className="text-purple-300 text-sm">Progress: </span>
                        <span className="text-white font-orbitron font-bold">{currentLevel}/1000</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/40 rounded-xl p-4 text-center backdrop-blur-sm">
                        <div className="text-3xl font-orbitron font-bold text-blue-400">{currentLevel}</div>
                        <div className="text-sm text-blue-200">Current Level</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-400/40 rounded-xl p-4 text-center backdrop-blur-sm">
                        <div className="text-3xl font-orbitron font-bold text-green-400">{completedLevels.size}</div>
                        <div className="text-sm text-green-200">Completed</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/40 rounded-xl p-4 text-center backdrop-blur-sm">
                        <div className="text-3xl font-orbitron font-bold text-purple-400">{1000 - currentLevel}</div>
                        <div className="text-sm text-purple-200">Remaining</div>
                    </div>
                </div>
            </div>

            {/* Level Grid */}
            <div className="relative z-10 px-6 pb-6">
                <div className="max-w-6xl mx-auto bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="grid grid-cols-10 gap-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {renderLevelGrid()}
                    </div>
                </div>
            </div>
        </div>
    );
}
