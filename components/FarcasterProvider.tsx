"use client";

import { useEffect, useState, createContext, useContext } from "react";

interface FarcasterContextType {
    user: any | null;
    isReady: boolean;
}

const FarcasterContext = createContext<FarcasterContextType>({
    user: null,
    isReady: false,
});

export const useFarcaster = () => useContext(FarcasterContext);

export default function FarcasterProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const init = async () => {
            if (typeof window === 'undefined') return;

            try {
                const sdk = await import('@farcaster/frame-sdk');
                const context = await sdk.default.context;

                if (context?.user) {
                    setUser(context.user);
                    console.log("Farcaster user found:", context.user);
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
        <FarcasterContext.Provider value={{ user, isReady }}>
            {children}
        </FarcasterContext.Provider>
    );
}
