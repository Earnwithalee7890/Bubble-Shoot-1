"use client";

import { useState, useEffect } from "react";
import { useFarcaster } from "./FarcasterProvider";

export default function MiniAppPrompt() {
    const { isReady, isAppAdded, notificationsEnabled, addMiniApp, requestNotifications, user } = useFarcaster();
    const [showPrompt, setShowPrompt] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Show prompt only when SDK is ready and user hasn't added the app
        if (isReady && user && !isAppAdded && !dismissed) {
            // Small delay for better UX
            const timer = setTimeout(() => setShowPrompt(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [isReady, isAppAdded, user, dismissed]);

    const handleAddApp = async () => {
        setIsLoading(true);
        await addMiniApp();
        setIsLoading(false);
        setShowPrompt(false);
    };

    const handleEnableNotifications = async () => {
        setIsLoading(true);
        await requestNotifications();
        setIsLoading(false);
    };

    const handleDismiss = () => {
        setDismissed(true);
        setShowPrompt(false);
    };

    if (!showPrompt || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border border-purple-500/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl shadow-purple-500/20 animate-slideUp">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <span className="text-4xl">🎮</span>
                    </div>
                    <h2 className="text-xl font-orbitron font-bold text-white mb-2">
                        Add Bubble Shot
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Add to your apps for quick access & daily reminders!
                    </p>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <span>⚡</span>
                        </div>
                        <span className="text-slate-300">Quick launch from your app list</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <span>🔔</span>
                        </div>
                        <span className="text-slate-300">Daily reminders to play & earn</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                            <span>💎</span>
                        </div>
                        <span className="text-slate-300">Never miss your streak rewards</span>
                    </div>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                    {!isAppAdded ? (
                        <button
                            onClick={handleAddApp}
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <span>✨</span>
                                    Add Mini App
                                </>
                            )}
                        </button>
                    ) : !notificationsEnabled ? (
                        <button
                            onClick={handleEnableNotifications}
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Enabling...
                                </>
                            ) : (
                                <>
                                    <span>🔔</span>
                                    Enable Daily Reminders
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="text-center text-green-400 py-3">
                            ✅ All set! You're ready to play!
                        </div>
                    )}

                    <button
                        onClick={handleDismiss}
                        className="w-full py-2 text-slate-400 hover:text-white text-sm transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
}
