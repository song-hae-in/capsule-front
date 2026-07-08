import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying TimeCapsule with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const TimeCapsule = await ethers.getContractFactory("TimeCapsule");
  const timeCapsule = await TimeCapsule.deploy();

  await timeCapsule.waitForDeployment();

  const contractAddress = await timeCapsule.getAddress();
  console.log("TimeCapsule deployed to:", contractAddress);
  console.log("");
  console.log("Next steps:");
  console.log(`  1. Update CONTRACT_ADDRESS in src/shared/config/index.ts to "${contractAddress}"`);
  console.log("  2. Run 'npm run copy-abi' to extract the compiled ABI");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
