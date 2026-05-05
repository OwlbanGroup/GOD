/**
 * deploy.js - Deployment script for Quantum Bitcoin
 * 
 * Deploys the QuantumBitcoin smart contract to Ethereum network.
 * 
 * Usage:
 *   npx hardhat run scripts/deploy.js
 *   npx hardhat run scripts/deploy.js --network sepolia
 *   npx hardhat run scripts/deploy.js --network mainnet
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    
    console.log("=".repeat(60));
    console.log("Quantum Bitcoin Deployment");
    console.log("=".repeat(60));
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
    console.log("");
    
    // Deploy QuantumBitcoin
    console.log("Deploying QuantumBitcoin...");
    const QuantumBitcoin = await hre.ethers.getContractFactory("QuantumBitcoin");
    const quantumBitcoin = await QuantumBitcoin.deploy();
    await quantumBitcoin.waitForDeployment();
    const qbtcAddress = await quantumBitcoin.getAddress();
    console.log("QuantumBitcoin deployed to:", qbtcAddress);
    console.log("");
    
    // Get token info
    const name = await quantumBitcoin.name();
    const symbol = await quantumBitcoin.symbol();
    const decimals = await quantumBitcoin.decimals();
    const totalSupply = await quantumBitcoin.totalSupply();
    
    console.log("Token Details:");
    console.log("  Name:", name);
    console.log("  Symbol:", symbol);
    console.log("  Decimals:", decimals);
    console.log("  Total Supply:", hre.ethers.formatUnits(totalSupply, decimals));
    console.log("");
    
    // Save deployment info
    const networkName = hre.network.name;
    const deploymentInfo = {
        network: networkName,
        QuantumBitcoin: {
            address: qbtcAddress,
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
            name: name,
            symbol: symbol,
            decimals: decimals,
            totalSupply: totalSupply.toString()
        }
    };
    
    // Write to deployment file
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to:", deploymentFile);
    
    console.log("");
    console.log("=".repeat(60));
    console.log("Deployment Complete!");
    console.log("=".repeat(60));
    console.log("");
    console.log("Next steps:");
    console.log("  1. Verify contract on Etherscan:");
    console.log(`     npx hardhat verify --network ${networkName} ${qbtcAddress}`);
    console.log("");
    console.log("  2. Update client configuration with:");
    console.log(`     Contract Address: ${qbtcAddress}`);
    console.log("");
    console.log("  3. Add to frontend/index.html:");
    console.log(`     <script src="quantum-bitcoin.js"></script>`);
    console.log("");
    
    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
