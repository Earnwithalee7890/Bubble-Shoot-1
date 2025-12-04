"use client";

import { useEffect, useState, createContext, useContext } from "react";

interface FarcasterContextType {
    user: any | null;
    isReady: boolean;
    farcasterAddress: string | null;
}

const FarcasterContext = createContext<FarcasterContextType>({
    user: null,
    isReady: false,
    farcasterAddress: null,
});

export const useFarcaster = () => useContext(FarcasterContext);

export default function FarcasterProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [farcasterAddress, setFarcasterAddress] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            if (typeof window === 'undefined') return;

            try {
                const sdk = await import('@farcaster/frame-sdk');
                const context = await sdk.default.context;

                if (context?.user) {
                    setUser(context.user);
                    console.log("Farcaster user found:", context.user);

                    // Debug: Log all keys to see structure
                    console.log("Context keys:", Object.keys(context));
                    console.log("User keys:", Object.keys(context.user));

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

                await sdk.default.actions.ready();
                setIsReady(true);
                console.log("Farcaster SDK ready called");
            } catch (err) {
                console.error("Error initializing Farcaster SDK:", err);
            }
        };
        init();
    }, []);

    return (
        <FarcasterContext.Provider value={{ user, isReady, farcasterAddress }}>
            {children}
        </FarcasterContext.Provider>
    );
}
