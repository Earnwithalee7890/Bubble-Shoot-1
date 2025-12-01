"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

export function useCheckIn() {
    const { address } = useAccount();
    const [canCheckIn, setCanCheckIn] = useState(false);
    const [lastCheckIn, setLastCheckIn] = useState<number | null>(null);
    const [streak, setStreak] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Check status from API
    useEffect(() => {
        const checkStatus = async () => {
            if (!address) return;

            try {
                const response = await fetch(`/api/check-in?address=${address}`);
                const data = await response.json();

                if (data.error) {
                    console.error("Error fetching check-in status:", data.error);
                    return;
                }

                setCanCheckIn(data.canCheckIn);
                setStreak(data.streak);
                if (data.lastCheckIn) {
                    setLastCheckIn(new Date(data.lastCheckIn).getTime());
                }
            } catch (error) {
                console.error("Error checking check-in status:", error);
            }
        };

        checkStatus();
    }, [address]);

    const checkIn = async () => {
        if (!address || !canCheckIn) return;

        setIsLoading(true);
        try {
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
