'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { ReactNode } from 'react';

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '00000000000000000000000000000000'; // Fallback to prevent crash

// 2. Set up Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
    networks: [base],
    projectId,
    ssr: true
});

// 3. Create modal
createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [base],
    defaultNetwork: base,
    metadata: {
        name: 'Bubble Shot',
        description: 'Crypto Bubble Shooter Game',
        url: typeof window !== 'undefined' ? window.location.origin : '',
        icons: ['https://avatars.githubusercontent.com/u/37784886']
    },
    features: {
        analytics: true,
    },
    themeMode: 'dark',
    themeVariables: {
        '--w3m-accent': '#0052FF',
        '--w3m-border-radius-master': '12px',
    }
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
