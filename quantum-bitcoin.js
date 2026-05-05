/**
 * QuantumBitcoin.js - JavaScript Client for Quantum Bitcoin
 * 
 * A quantum-resistant Bitcoin-like token running on Ethereum PoS
 * that uses data center compute power instead of natural resources.
 * 
 * Mission: Save humanity and Earth by providing environmentally sustainable
 * cryptocurrency infrastructure.
 * 
 * This is NOT malware - it's legitimate blockchain technology.
 */

// Import ethers.js for Ethereum interaction
const { ethers } = require('ethers');

// Quantum Bitcoin ContractABI (minimal for interaction)
const QUANTUM_BITCOIN_ABI = [
    // ERC20 basics
    "function name() view returns (string)",
    "function symbol() view returns (string)", 
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    
    // Quantum Bitcoin specific
    "function registerDataCenter(string name, string location)",
    "function verifyGreenEnergy(address operator, uint256 energyUsage, uint256 renewablePercent)",
    "function stake(uint256 amount, uint256 computePower)",
    "function claimRewards()",
    "function withdrawStake(uint256 amount)",
    "function getDataCenter(address operator) view returns (string, string, uint256, uint256, bool)",
    "function getValidator(address operator) view returns (uint256, uint256, uint256, bool)",
    "function getEnvironmentalStats() view returns (uint256, uint256, uint256, uint256)",
    "function quantumHash(bytes data) view returns (bytes32)",
    "function pause()",
    "function unpause()",
    
    // Events
    "event DataCenterRegistered(address indexed operator, string name, string location)",
    "event GreenVerified(address indexed operator, uint256 renewablePercent)",
    "event ComputeStaked(address indexed operator, uint256 amount)",
    "event ValidatorRewarded(address indexed operator, uint256 reward)",
    "event EnvironmentalImpact(uint256 greenEnergy, uint256 carbonSaved)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];

/**
 * QuantumBitcoinClient - Main client for interacting with QuantumBitcoin
 */
class QuantumBitcoinClient {
    constructor(provider, signerOrContractAddress) {
        this.provider = provider;
        this.signer = null;
        this.contract = null;
        this.contractAddress = null;
        this.decimals = 18;
        
        // If signer provided, initialize
        if (signerOrContractAddress) {
            if (typeof signerOrContractAddress === 'string') {
                // It's a contract address
                this.contractAddress = signerOrContractAddress;
                this.signer = provider.getSigner();
            } else {
                // It's a signer
                this.signer = signerOrContractAddress;
                this.contractAddress = null;
            }
        }
    }
    
    /**
     * Connect to a deployed QuantumBitcoin contract
     */
    async connect(contractAddress) {
        this.contractAddress = contractAddress;
        
        if (this.signer) {
            this.contract = new ethers.Contract(
                contractAddress,
                QUANTUM_BITCOIN_ABI,
                this.signer
            );
        } else if (this.provider) {
            this.contract = new ethers.Contract(
                contractAddress,
                QUANTUM_BITCOIN_ABI,
                this.provider
            );
        }
        
        // Get token info
        if (this.contract) {
            this.decimals = await this.contract.decimals();
            this.symbol = await this.contract.symbol();
            this.name = await this.contract.name();
        }
        
        return this;
    }
    
    /**
     * Get token name
     */
    async getName() {
        if (!this.contract) throw new Error('Not connected');
        return await this.contract.name();
    }
    
    /**
     * Get token symbol
     */
    async getSymbol() {
        if (!this.contract) throw new Error('Not connected');
        return await this.contract.symbol();
    }
    
    /**
     * Get token decimals
     */
    async getDecimals() {
        if (!this.contract) throw new Error('Not connected');
        return await this.contract.decimals();
    }
    
    /**
     * Get total supply
     */
    async getTotalSupply() {
        if (!this.contract) throw new Error('Not connected');
        const supply = await this.contract.totalSupply();
        return ethers.formatUnits(supply, this.decimals);
    }
    
    /**
     * Get balance of an address
     */
    async getBalance(address) {
        if (!this.contract) throw new Error('Not connected');
        const balance = await this.contract.balanceOf(address);
        return ethers.formatUnits(balance, this.decimals);
    }
    
    /**
     * Get formatted balance (with symbol)
     */
    async getFormattedBalance(address) {
        const balance = await this.getBalance(address);
        return `${parseFloat(balance).toFixed(6)} ${this.symbol}`;
    }
    
    /**
     * Transfer QuantumBitcoin
     */
    async transfer(to, amount) {
        if (!this.contract) throw new Error('Not connected');
        
        const amountWei = ethers.parseUnits(amount.toString(), this.decimals);
        const tx = await this.contract.transfer(to, amountWei);
        
        return {
            hash: tx.hash,
            wait: () => tx.wait()
        };
    }
    
    /**
     * Register a data center
     */
    async registerDataCenter(name, location) {
        if (!this.contract) throw new Error('Not connected');
        
        const tx = await this.contract.registerDataCenter(name, location);
        await tx.wait();
        
        return { success: true, hash: tx.hash };
    }
    
    /**
     * Get data center information
     */
    async getDataCenterInfo(operator) {
        if (!this.contract) throw new Error('Not connected');
        
        const info = await this.contract.getDataCenter(operator);
        
        return {
            name: info[0],
            location: info[1],
            energyUsage: info[2].toString(),
            renewablePercent: info[3].toString(),
            verified: info[4]
        };
    }
    
    /**
     * Stake tokens to become a validator
     */
    async stake(amount, computePower) {
        if (!this.contract) throw new Error('Not connected');
        
        const amountWei = ethers.parseUnits(amount.toString(), this.decimals);
        const tx = await this.contract.stake(amountWei, computePower);
        await tx.wait();
        
        return { success: true, hash: tx.hash };
    }
    
    /**
     * Claim validator rewards
     */
    async claimRewards() {
        if (!this.contract) throw new Error('Not connected');
        
        const tx = await this.contract.claimRewards();
        await tx.wait();
        
        return { success: true, hash: tx.hash };
    }
    
    /**
     * Withdraw staked tokens
     */
    async withdrawStake(amount) {
        if (!this.contract) throw new Error('Not connected');
        
        const amountWei = ethers.parseUnits(amount.toString(), this.decimals);
        const tx = await this.contract.withdrawStake(amountWei);
        await tx.wait();
        
        return { success: true, hash: tx.hash };
    }
    
    /**
     * Get validator information
     */
    async getValidatorInfo(operator) {
        if (!this.contract) throw new Error('Not connected');
        
        const info = await this.contract.getValidator(operator);
        
        return {
            stakedAmount: ethers.formatUnits(info[0], this.decimals),
            computePower: info[1].toString(),
            rewards: ethers.formatUnits(info[2], this.decimals),
            active: info[3]
        };
    }
    
    /**
     * Get environmental statistics
     */
    async getEnvironmentalStats() {
        if (!this.contract) throw new Error('Not connected');
        
        const stats = await this.contract.getEnvironmentalStats();
        
        return {
            totalGreenEnergy: stats[0].toString(), // kWh
            totalStaked: ethers.formatUnits(stats[1], this.decimals),
            totalComputePower: stats[2].toString(), // TFLOPS
            carbonSaved: stats[3].toString() // kg CO2
        };
    }
    
    /**
     * Generate quantum-resistant hash
     */
    async quantumHash(data) {
        if (!this.contract) throw new Error('Not connected');
        
        const dataBytes = typeof data === 'string' 
            ? ethers.toUtf8Bytes(data) 
            : data;
        
        return await this.contract.quantumHash(dataBytes);
    }
    
    /**
     * Approve token for contract interaction
     */
    async approve(amount) {
        if (!this.contract) throw new Error('Not connected');
        
        const amountWei = ethers.parseUnits(amount.toString(), this.decimals);
        const tx = await this.contract.approve(this.contract.address, amountWei);
        await tx.wait();
        
        return { success: true, hash: tx.hash };
    }
    
    /**
     * Check if address is connected (has balance)
     */
    async isConnected() {
        try {
            const address = await this.signer?.getAddress();
            if (!address) return false;
            
            const balance = await this.contract.balanceOf(address);
            return balance.gt(0);
        } catch {
            return false;
        }
    }
    
    /**
     * Get current user address
     */
    async getAddress() {
        if (!this.signer) return null;
        return await this.signer.getAddress();
    }
    
    /**
     * Get wallet connection status
     */
    async getWalletStatus() {
        const address = await this.getAddress();
        
        if (!address) {
            return { connected: false, address: null, balance: '0' };
        }
        
        const balance = await this.getBalance(address);
        
        return {
            connected: true,
            address: address,
            balance: balance
        };
    }
    
    /**
     * Format amount with decimals
     */
    formatAmount(amount) {
        return ethers.formatUnits(amount, this.decimals);
    }
    
    /**
     * Parse amount to wei
     */
    parseAmount(amount) {
        return ethers.parseUnits(amount.toString(), this.decimals);
    }
    
    /**
     * Parse amount from wei
     */
    parseFromWei(amount) {
        return ethers.formatUnits(amount, this.decimals);
    }
}

/**
 * QuantumBitcoinWallet - Simple wallet for QuantumBitcoin
 */
class QuantumBitcoinWallet {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.client = null;
    }
    
    /**
     * Connect MetaMask or injected provider
     */
    async connect() {
        // Check for window.ethereum (MetaMask, etc.)
        if (typeof window !== 'undefined' && window.ethereum) {
            this.provider = new ethers.BrowserProvider(window.ethereum);
            
            // Request account access
            await this.provider.send("eth_requestAccounts", []);
            
            this.signer = await this.provider.getSigner();
            this.client = new QuantumBitcoinClient(this.provider, this.signer);
            
            return this;
        }
        
        throw new Error('No Ethereum provider found. Please install MetaMask.');
    }
    
    /**
     * Connect to contract
     */
    async connectToContract(contractAddress) {
        if (!this.client) {
            await this.connect();
        }
        
        await this.client.connect(contractAddress);
        return this.client;
    }
    
    /**
     * Get wallet info
     */
    async getInfo() {
        if (!this.client) throw new Error('Not connected');
        
        const address = await this.client.getAddress();
        const balance = await this.client.getBalance(address);
        
        return {
            address: address,
            balance: balance,
            symbol: this.client.symbol
        };
    }
}

/**
 * Utility functions for QuantumBitcoin
 */
const QuantumBitcoinUtils = {
    /**
     * Format QuantumBitcoin amount
     */
    formatQBTC(amount, decimals = 18) {
        return ethers.formatUnits(amount, decimals);
    },
    
    /**
     * Parse QuantumBitcoin amount to wei
     */
    parseQBTC(amount, decimals = 18) {
        return ethers.parseUnits(amount.toString(), decimals);
    },
    
    /**
     * Calculate approximate carbon savings
     * Based on renewable energy percentage
     */
    calculateCarbonSavings(energyKwh, renewablePercent) {
        // Average CO2 emissions per kWh: ~439g
        const co2PerKwh = 0.439; // kg CO2
        const renewableEnergy = energyKwh * (renewablePercent / 100);
        const carbonSaved = renewableEnergy * co2PerKwh;
        
        return {
            energyKwh: energyKwh,
            renewablePercent: renewablePercent,
            carbonSavedKg: carbonSaved.toFixed(2),
            carbonSavedTons: (carbonSaved / 1000).toFixed(4)
        };
    },
    
    /**
     * Validate Ethereum address
     */
    isValidAddress(address) {
        return ethers.isAddress(address);
    },
    
    /**
     * Format address for display
     */
    formatAddress(address, short = true) {
        if (short) {
            return `${address.slice(0, 6)}...${address.slice(-4)}`;
        }
        return address;
    },
    
    /**
     * Generate random quantum seed
     */
    generateQuantumSeed() {
        const randomBytes = ethers.randomBytes(32);
        return ethers.hexlify(randomBytes);
    }
};

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        QuantumBitcoinClient,
        QuantumBitcoinWallet,
        QuantumBitcoinUtils,
        QUANTUM_BITCOIN_ABI
    };
} else if (typeof window !== 'undefined') {
    // Browser export
    window.QuantumBitcoinClient = QuantumBitcoinClient;
    window.QuantumBitcoinWallet = QuantumBitcoinWallet;
    window.QuantumBitcoinUtils = QuantumBitcoinUtils;
}
