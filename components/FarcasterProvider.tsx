"use client";

import { useEffect } from "react";

export default function FarcasterProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const init = async () => {
            // Only run on client side
            if (typeof window === 'undefined') return;

            try {
                const sdk = await import('@farcaster/frame-sdk');
                await sdk.default.actions.ready();
                console.log("Farcaster SDK ready called");
            } catch (err) {
                console.error("Error calling sdk.actions.ready:", err);
            }
        };
        init();
    }, []);

    return <>{children}</>;
}
