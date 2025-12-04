"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

export function useCheckIn() {
    const { address } = useAccount();
    const [canCheckIn, setCanCheckIn] = useState(true);
    const [lastCheckIn, setLastCheckIn] = useState<number | null>(null);
    const [streak, setStreak] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [useLocalStorage, setUseLocalStorage] = useState(false);

    // Helper to get UTC date string (YYYY-MM-DD)
    const getUTCDateString = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    // Check status from API or localStorage
    useEffect(() => {
        const checkStatus = async () => {
            if (!address) return;

            try {
                const response = await fetch(`/api/check-in?address=${address}`);
                const data = await response.json();

                // Check if API is actually working or returning HTML/Error
                if (!response.ok || (data.error && data.error.includes('fetch failed'))) {
                    throw new Error('API unavailable');
                }

                setCanCheckIn(data.canCheckIn);
                setStreak(data.streak);
                if (data.lastCheckIn) {
                    setLastCheckIn(new Date(data.lastCheckIn).getTime());
                }
                setUseLocalStorage(false); // API worked, so don't use local storage
            } catch (error) {
                console.warn("API check failed, falling back to localStorage:", error);
                setUseLocalStorage(true);

                // Local Storage Fallback Logic
                const localData = localStorage.getItem(`checkin_${address}`);
                if (localData) {
                    try {
                        const parsed = JSON.parse(localData);
                        const lastCheckInDate = new Date(parsed.lastCheckIn);
                        const today = new Date();

                        const lastDateUTC = getUTCDateString(lastCheckInDate);
                        const todayUTC = getUTCDateString(today);

                        setCanCheckIn(lastDateUTC !== todayUTC);
                        setStreak(parsed.streak || 0);
                        setLastCheckIn(parsed.lastCheckIn);
                    } catch (e) {
                        console.error("Error parsing local storage data", e);
                        setCanCheckIn(true);
                        setStreak(0);
                    }
                } else {
                    setCanCheckIn(true);
                    setStreak(0);
                }
            }
        };

        checkStatus();
    }, [address]);

    const checkIn = async () => {
        if (!address || !canCheckIn) return;

        setIsLoading(true);
        try {
            if (useLocalStorage) {
                // Use localStorage for testing/fallback
                const now = new Date();
                const todayUTC = getUTCDateString(now);

                const localData = localStorage.getItem(`checkin_${address}`);
                let newStreak = 1;

                if (localData) {
                    const parsed = JSON.parse(localData);
                    const lastCheckInDate = new Date(parsed.lastCheckIn);
                    const lastDateUTC = getUTCDateString(lastCheckInDate);

                    // Calculate yesterday
                    const yesterday = new Date(now);
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayUTC = getUTCDateString(yesterday);

                    if (lastDateUTC === todayUTC) {
                        throw new Error("Already checked in today (Local)");
                    }

                    if (lastDateUTC === yesterdayUTC) {
                        newStreak = (parsed.streak || 0) + 1;
                    }
                }

                const newState = {
                    lastCheckIn: now.getTime(),
                    streak: newStreak
                };

                localStorage.setItem(`checkin_${address}`, JSON.stringify(newState));

                setStreak(newStreak);
                setLastCheckIn(now.getTime());
                setCanCheckIn(false);

                return { success: true, streak: newStreak };
            }

            const response = await fetch('/api/check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Check-in failed');
            }

            setStreak(data.streak);
            setLastCheckIn(Date.now());
            setCanCheckIn(false);

            return data;

        } catch (error) {
            console.error("Check-in failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        checkIn,
        isLoading,
        canCheckIn,
        streak,
        lastCheckIn,
    };
}
