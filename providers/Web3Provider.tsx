'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { farcasterFrame } from '@farcaster/frame-wagmi-connector';
import { ReactNode, useEffect, useState } from 'react';

// Create wagmi config with Farcaster connector
const config = createConfig({
    chains: [base],
    transports: {
        [base.id]: http(),
    },
    connectors: [
        farcasterFrame(),
    ],
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Auto-connect to Farcaster wallet when in a Frame
    useEffect(() => {
        const autoConnect = async () => {
            if (typeof window === 'undefined') return;

            try {
                // Check if we're in a Farcaster Frame context
                const sdk = await import('@farcaster/frame-sdk');
                const context = await sdk.default.context;

                if (context) {
                    console.log('Farcaster context detected, auto-connecting...');

                    // Get the Farcaster connector
                    const connector = config.connectors.find(c => c.id === 'farcasterFrame');
                    if (connector) {
                        try {
                            await config.connect({ connector });
                            console.log('Auto-connected to Farcaster wallet!');
                        } catch (connectError) {
                            console.log('Auto-connect failed, user may need to manually connect:', connectError);
                        }
                    }
                }
            } catch (error) {
                console.log('Not in Farcaster context or error:', error);
            }
        };

        if (mounted) {
            autoConnect();
        }
    }, [mounted]);

    if (!mounted) {
        return null;
    }

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
