'use client';

import dynamic from 'next/dynamic';

// Dynamically import the actual wallet component with ssr: false
const WalletConnectClient = dynamic(() => import('./WalletConnectClient'), {
    ssr: false,
    loading: () => (
        <button className="btn-primary" disabled>
            Loading...
        </button>
    ),
});

export function WalletConnect() {
    return <WalletConnectClient />;
}
