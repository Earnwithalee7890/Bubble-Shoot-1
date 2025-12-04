'use client';

import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { base } from 'wagmi/chains';
import { useEffect } from 'react';
import { useFarcaster } from './FarcasterProvider';

export default function WalletConnectClient() {
    const { open } = useAppKit();
    const { address, isConnected } = useAppKitAccount();
    const { chainId, switchNetwork } = useAppKitNetwork();
    const { farcasterAddress } = useFarcaster();

    // Auto-switch to Base Mainnet if connected to wrong network
    useEffect(() => {
        if (isConnected && chainId !== base.id && switchNetwork) {
            switchNetwork(base);
        }
    }, [isConnected, chainId, switchNetwork]);

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    // Use Farcaster address if Wagmi is not connected
    const displayAddress = isConnected && address ? address : farcasterAddress;
    const isEffectivelyConnected = isConnected || !!farcasterAddress;

    return (
        <div className="wallet-connect">
            {isEffectivelyConnected && displayAddress ? (
                <button
                    onClick={() => open()}
                    className="btn-secondary flex items-center gap-2"
                >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-mono">{formatAddress(displayAddress)}</span>
                    {farcasterAddress && !isConnected && <span className="text-xs text-purple-300">(Farcaster)</span>}
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
