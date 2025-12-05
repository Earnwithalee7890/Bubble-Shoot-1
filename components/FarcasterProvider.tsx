"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";

interface NotificationDetails {
    token: string;
    url: string;
}

interface FarcasterContextType {
    user: any | null;
    isReady: boolean;
    farcasterAddress: string | null;
    isAppAdded: boolean;
    notificationsEnabled: boolean;
    addMiniApp: () => Promise<void>;
    requestNotifications: () => Promise<void>;
}

const FarcasterContext = createContext<FarcasterContextType>({
    user: null,
    isReady: false,
    farcasterAddress: null,
    isAppAdded: false,
    notificationsEnabled: false,
    addMiniApp: async () => { },
    requestNotifications: async () => { },
});

export const useFarcaster = () => useContext(FarcasterContext);

export default function FarcasterProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [farcasterAddress, setFarcasterAddress] = useState<string | null>(null);
    const [isAppAdded, setIsAppAdded] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [sdk, setSdk] = useState<any>(null);

    // Add Mini App to user's app list
    const addMiniApp = useCallback(async () => {
        if (!sdk) return;
        try {
            const result = await sdk.default.actions.addFrame();
            if (result?.added) {
                setIsAppAdded(true);
                console.log("Mini app added successfully!");

                // Store notification details if provided
                if (result.notificationDetails) {
                    await saveNotificationToken(result.notificationDetails);
                    setNotificationsEnabled(true);
                }
            }
        } catch (err) {
            console.error("Error adding mini app:", err);
        }
    }, [sdk]);

    // Request notification permission
    const requestNotifications = useCallback(async () => {
        if (!sdk) return;
        try {
            const result = await sdk.default.actions.requestNotifications();
            if (result?.success && result.notificationDetails) {
                await saveNotificationToken(result.notificationDetails);
                setNotificationsEnabled(true);
                console.log("Notifications enabled successfully!");
            }
        } catch (err) {
            console.error("Error requesting notifications:", err);
        }
    }, [sdk]);

    // Save notification token to database
    const saveNotificationToken = async (details: NotificationDetails) => {
        if (!user?.fid) return;

        try {
            await fetch('/api/notifications/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fid: user.fid,
                    token: details.token,
                    url: details.url,
                }),
            });
        } catch (err) {
            console.error("Error saving notification token:", err);
        }
    };

    useEffect(() => {
        const init = async () => {
            if (typeof window === 'undefined') return;

            try {
                const farcasterSdk = await import('@farcaster/frame-sdk');
                setSdk(farcasterSdk);

                const context = await farcasterSdk.default.context;

                if (context?.user) {
                    setUser(context.user);
                    console.log("Farcaster user found:", context.user);

                    // Check if app is already added
                    if (context.client?.added) {
                        setIsAppAdded(true);
                    }

                    // Check if notifications are enabled
                    if (context.client?.notificationDetails) {
                        setNotificationsEnabled(true);
                    }

                    let addr: string | null = null;

                    // Check for verifiedAddresses (camelCase)
                    const verified = (context.user as any).verifiedAddresses as string[];
                    if (verified && verified.length > 0) {
                        addr = verified[0];
                    }

                    // Check for verified_addresses (snake_case)
                    if (!addr) {
                        const verifiedSnake = (context.user as any).verified_addresses as string[];
                        if (verifiedSnake && verifiedSnake.length > 0) {
                            addr = verifiedSnake[0];
                        }
                    }

                    // Check for custodyAddress (camelCase)
                    if (!addr && (context.user as any).custodyAddress) {
                        addr = (context.user as any).custodyAddress;
                    }

                    // Check for custody_address (snake_case)
                    if (!addr && (context.user as any).custody_address) {
                        addr = (context.user as any).custody_address;
                    }

                    if (addr) {
                        console.log("Found Farcaster address:", addr);
                        setFarcasterAddress(addr);
                    } else {
                        console.warn("No address found in Farcaster context");
                    }
                } else {
                    console.log("No Farcaster user in context");
                }

                await farcasterSdk.default.actions.ready();
                setIsReady(true);
                console.log("Farcaster SDK ready called");
            } catch (err) {
                console.error("Error initializing Farcaster SDK:", err);
            }
        };
        init();
    }, []);

    return (
        <FarcasterContext.Provider value={{
            user,
            isReady,
            farcasterAddress,
            isAppAdded,
            notificationsEnabled,
            addMiniApp,
            requestNotifications,
        }}>
            {children}
        </FarcasterContext.Provider>
    );
}
