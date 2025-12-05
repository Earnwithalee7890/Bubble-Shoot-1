import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";

const inter = Inter({
    subsets: ["latin"],
    variable: '--font-inter',
});

const orbitron = Orbitron({
    subsets: ["latin"],
    variable: '--font-orbitron',
});

export const metadata: Metadata = {
    title: "Bubble Shot - Crypto Bubble Shooter Game",
    description: "Play Bubble Shot, the ultimate crypto-themed bubble shooter game with 1,000 levels. Connect your wallet, earn DEGEN rewards, and climb the leaderboard!",
    keywords: ["crypto game", "bubble shooter", "Web3 game", "DEGEN", "Base Mainnet", "blockchain game"],
    openGraph: {
        title: "Bubble Shot - Crypto Bubble Shooter Game",
        description: "Play and earn DEGEN rewards in this crypto-themed bubble shooter!",
        type: "website",
        images: [
            {
                url: "https://bubble-shoot-1.vercel.app/images/og-image.png",
                width: 1200,
                height: 800,
                alt: "Bubble Shot Game",
            },
        ],
    },
    other: {
        "fc:frame": JSON.stringify({
            version: "1",
            imageUrl: "https://bubble-shoot-1.vercel.app/images/og-image.png",
            button: {
                title: "Play Now",
                action: {
                    type: "launch_miniapp",
                    name: "Bubble Shot",
                    url: "https://bubble-shoot-1.vercel.app",
                    splashImageUrl: "https://bubble-shoot-1.vercel.app/images/splash.png",
                    splashBackgroundColor: "#1a1a2e",
                },
            },
        }),
    },
};

import FarcasterProvider from "@/components/FarcasterProvider";
import MiniAppPrompt from "@/components/MiniAppPrompt";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${orbitron.variable} antialiased`}>
                <FarcasterProvider>
                    <Web3Provider>
                        {children}
                        <MiniAppPrompt />
                    </Web3Provider>
                </FarcasterProvider>
            </body>
        </html>
    );
}
