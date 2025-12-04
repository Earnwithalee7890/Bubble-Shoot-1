'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { frameConnector } from '@/lib/connector';
import { ReactNode, useEffect, useState } from 'react';

// Create wagmi config with Farcaster frame connector
export const config = createConfig({
    chains: [base],
    transports: {
        [base.id]: http(),
    },
    connectors: [frameConnector()],
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
