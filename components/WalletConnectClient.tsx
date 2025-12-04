'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function WalletConnectClient() {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const handleConnect = () => {
        // Connect using the first available connector (Farcaster frame connector)
        const connector = connectors[0];
        if (connector) {
            connect({ connector });
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
