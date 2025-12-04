# 🎯 Bubble Shot

A crypto-powered bubble shooter game with daily check-in rewards on Base Mainnet.

![Bubble Shot](https://img.shields.io/badge/Base-Mainnet-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Solidity](https://img.shields.io/badge/Solidity-0.8.20-purple)

## ✨ Features

- 🎮 **Classic Bubble Shooter Gameplay** - Match and pop bubbles to score points
- 💰 **Web3 Integration** - Connect your wallet via WalletConnect/Reown AppKit
- 📅 **Daily Check-In System** - Check in daily on-chain to build streaks
- 🔥 **Streak Rewards** - Maintain your streak for bonus rewards
- 🏆 **Leaderboard** - Compete with other players
- 📱 **Mobile Responsive** - Play on any device

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- MetaMask or any WalletConnect-compatible wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Earnwithalee7890/Bubble-Shoot-1.git
cd Bubble-Shoot-1
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Create a `.env` file with the following variables:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_CHECKIN_CONTRACT_ADDRESS=0x48181E31c8b3f7047634eb3d391Ecb5f9971E04B
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 How to Play

1. **Connect Wallet** - Click "Connect Wallet" to link your Base-compatible wallet
2. **Daily Check-In** - Click "CHECK IN NOW" to record your daily check-in on-chain
3. **Play the Game** - Click "PLAY NOW" to start the bubble shooter
4. **Build Streaks** - Check in daily to maintain and grow your streak

## 🔗 Smart Contracts

### DailyCheckIn Contract
- **Network:** Base Mainnet
- **Address:** `0x48181E31c8b3f7047634eb3d391Ecb5f9971E04B`
- **Function:** Records user check-ins on-chain with timestamps

```solidity
function checkIn() external {
    lastCheckInTime[msg.sender] = block.timestamp;
    emit CheckedIn(msg.sender, block.timestamp);
}
```

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS
- **Game Engine:** Phaser 3
- **Web3:** wagmi, viem, Reown AppKit
- **Smart Contracts:** Solidity, Hardhat
- **Database:** Supabase
- **Blockchain:** Base Mainnet

## 📁 Project Structure

```
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── game/              # Game page
│   ├── leaderboard/       # Leaderboard page
│   └── levels/            # Levels page
├── components/            # React components
│   ├── DailyCheckIn.tsx  # Check-in component
│   ├── GameCanvas.tsx    # Phaser game canvas
│   └── WalletConnect.tsx # Wallet connection
├── contracts/             # Solidity contracts
├── hooks/                 # Custom React hooks
├── providers/             # Context providers
├── scripts/               # Deployment scripts
└── public/                # Static assets
```

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy Smart Contract

```bash
npx hardhat run scripts/deploy_checkin.ts --network base
```

## 📜 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

Built with ❤️ for the crypto community

---

**Powered by Base Mainnet** 🔵
