'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { base } from 'wagmi/chains';
import { useEffect } from 'react';

export default function WalletConnectClient() {
    const { address, isConnected, chain } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const handleConnect = () => {
        // Find the Farcaster connector
        const farcasterConnector = connectors.find(c => c.id === 'farcasterFrame');
        if (farcasterConnector) {
            connect({ connector: farcasterConnector });
        } else if (connectors.length > 0) {
            connect({ connector: connectors[0] });
        }
    };

    return (
        <div className="wallet-connect">
            {isConnected && address ? (
                <button
                    onClick={() => disconnect()}
                    className="btn-secondary flex items-center gap-2"
                >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-mono">{formatAddress(address)}</span>
                </button>
            ) : (
                <button
                    onClick={handleConnect}
                    className="btn-primary"
                >
                    Connect Wallet
                </button>
            )}
        </div>
    );
}
