const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying DailyCheckIn contract...");

    const DailyCheckIn = await ethers.getContractFactory("DailyCheckIn");
    const checkIn = await DailyCheckIn.deploy();

    await checkIn.waitForDeployment();

    const address = await checkIn.getAddress();
    console.log(`DailyCheckIn deployed to: ${address}`);

    console.log("Verify with:");
    console.log(`npx hardhat verify --network base ${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
