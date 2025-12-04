import { ethers } from "hardhat";

async function main() {
    console.log("Deploying DailyCheckInNFT contract...");

    const DailyCheckInNFT = await ethers.getContractFactory("DailyCheckInNFT");
    const checkInNFT = await DailyCheckInNFT.deploy();

    await checkInNFT.waitForDeployment();

    const address = await checkInNFT.getAddress();
    console.log(`DailyCheckInNFT deployed to: ${address}`);

    console.log("Verify with:");
    console.log(`npx hardhat verify --network base ${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
