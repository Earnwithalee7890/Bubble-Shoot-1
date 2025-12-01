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
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${orbitron.variable} antialiased`}>
                <Web3Provider>
                    {children}
                </Web3Provider>
            </body>
        </html>
    );
}
