"use client";
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

                    // Try to get the first verified address (usually ETH/Base)
                    // If not available, fall back to custody address if it's an ETH address
                    // Note: The SDK types might need checking, but usually it's verifiedAddresses
                    const verified = (context.user as any).verifiedAddresses as string[];
                    if (verified && verified.length > 0) {
                        setFarcasterAddress(verified[0]);
                    } else if ((context.user as any).custodyAddress) {
                        setFarcasterAddress((context.user as any).custodyAddress);
                    }
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
