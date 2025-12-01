'use client';

import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { base } from 'wagmi/chains';
import { useEffect } from 'react';

export function WalletConnect() {
    const { open } = useAppKit();
    const { address, isConnected } = useAppKitAccount();
    const { chainId, switchNetwork } = useAppKitNetwork();

    // Auto-switch to Base Mainnet if connected to wrong network
    useEffect(() => {
        if (isConnected && chainId !== base.id && switchNetwork) {
            switchNetwork(base);
        }
    }, [isConnected, chainId, switchNetwork]);

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <div className="wallet-connect">
            {isConnected && address ? (
                <button
                    onClick={() => open()}
                    className="btn-secondary flex items-center gap-2"
                >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-mono">{formatAddress(address)}</span>
                </button>
            ) : (
                <button
                    onClick={() => open()}
                    className="btn-primary"
                >
                    Connect Wallet
                </button>
            )}
        </div>
    );
}
