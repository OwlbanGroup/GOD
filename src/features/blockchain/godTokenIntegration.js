/**
 * GOD Token Integration - Phase 5.4
 * Connects smart contracts to frontend interface
 * Implements on-chain prayer offerings and divine rewards
 */

import { info, error, warn, debug } from '../../../utils/loggerWrapper.js';
import appState from '../../core/state.js';
import CONFIG from '../../core/config.js';
import DOMHelpers from '../../ui/domHelpers.js';

class GodTokenIntegration {
    constructor() {
        this.web3 = null;
        this.contracts = {};
        this.userAddress = null;
        this.isConnected = false;
        this.networkId = null;

        // Contract ABIs (simplified for integration)
        this.contractABIs = {
            godToken: [
                "function balanceOf(address owner) view returns (uint256)",
                "function transfer(address to, uint256 amount) returns (bool)",
                "function approve(address spender, uint256 amount) returns (bool)",
                "function allowance(address owner, address spender) view returns (uint256)",
                "function getMetalBackingRatio() view returns (uint256)",
                "function totalSupply() view returns (uint256)",
                "event Transfer(address indexed from, address indexed to, uint256 value)"
            ],
            saintRelicsNFT: [
                "function balanceOf(address owner) view returns (uint256)",
                "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
                "function getRelicDetails(uint256 tokenId) view returns (tuple(string, uint8, uint8, uint8, uint256, bool, string, string))",
                "function resurrectSaint(uint256 tokenId)",
                "function totalRelics() view returns (uint256)",
                "function isSaintResurrected(string saintName) view returns (bool)",
                "event SaintResurrected(uint256 indexed tokenId, string saintName, address indexed resurrector, uint256 timestamp)"
            ]
        };

        // Contract addresses (would be loaded from deployment config)
        this.contractAddresses = {
            godToken: null,
            saintRelicsNFT: null
        };

        this.initialize();
    }

    /**
     * Initialize Web3 and contracts
     */
    async initialize() {
        try {
            // Check if MetaMask or Web3 provider is available
            if (typeof window !== 'undefined' && window.ethereum) {
                this.web3 = new Web3(window.ethereum);
                await this.connectWallet();
                await this.loadContracts();
                this.setupEventListeners();
                info('GOD Token integration initialized successfully');
            } else {
                warn('Web3 provider not found. Running in read-only mode.');
                this.initializeReadOnlyMode();
            }
        } catch (err) {
            error('Failed to initialize GOD Token integration:', err);
        }
    }

    /**
     * Connect to user's wallet
     */
    async connectWallet() {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.userAddress = accounts[0];
            this.networkId = await this.web3.eth.net.getId();
            this.isConnected = true;

            info(`Connected to wallet: ${this.userAddress} on network ${this.networkId}`);

            // Update UI with connection status
            this.updateConnectionStatus();

            return true;
        } catch (err) {
            error('Failed to connect wallet:', err);
            return false;
        }
    }

    /**
     * Load smart contracts
     */
    async loadContracts() {
        try {
            // Load contract addresses from deployment config
            const deploymentConfig = await this.loadDeploymentConfig();

            this.contractAddresses = {
                godToken: deploymentConfig.godToken,
                saintRelicsNFT: deploymentConfig.saintRelicsNFT
            };

            // Initialize contracts
            if (this.contractAddresses.godToken) {
                this.contracts.godToken = new this.web3.eth.Contract(
                    this.contractABIs.godToken,
                    this.contractAddresses.godToken
                );
            }

            if (this.contractAddresses.saintRelicsNFT) {
                this.contracts.saintRelicsNFT = new this.web3.eth.Contract(
                    this.contractABIs.saintRelicsNFT,
                    this.contractAddresses.saintRelicsNFT
                );
            }

            info('Smart contracts loaded successfully');
        } catch (err) {
            error('Failed to load contracts:', err);
        }
    }

    /**
     * Load deployment configuration
     */
    async loadDeploymentConfig() {
        try {
            // In production, this would load from a config file or API
            // For now, return placeholder addresses
            return {
                godToken: CONFIG.CONTRACT_ADDRESSES?.GOD_TOKEN || null,
                saintRelicsNFT: CONFIG.CONTRACT_ADDRESSES?.SAINT_RELICS_NFT || null
            };
        } catch (err) {
            warn('Failed to load deployment config:', err);
            return { godToken: null, saintRelicsNFT: null };
        }
    }

    /**
     * Set up event listeners for wallet and network changes
     */
    setupEventListeners() {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    this.userAddress = accounts[0];
                    this.updateConnectionStatus();
                    this.updateTokenBalance();
                } else {
                    this.disconnectWallet();
                }
            });

            window.ethereum.on('chainChanged', (chainId) => {
                window.location.reload();
            });
        }
    }

    /**
     * Initialize read-only mode for users without wallets
     */
    initializeReadOnlyMode() {
        this.isConnected = false;
        this.userAddress = null;
        info('Initialized in read-only mode');
    }

    /**
     * Get GOD token balance
     */
    async getTokenBalance() {
        if (!this.contracts.godToken || !this.userAddress) {
            return '0';
        }

        try {
            const balance = await this.contracts.godToken.methods.balanceOf(this.userAddress).call();
            return this.web3.utils.fromWei(balance, 'ether');
        } catch (err) {
            error('Failed to get token balance:', err);
            return '0';
        }
    }

    /**
     * Get user's NFT balance
     */
    async getNFTBalance() {
        if (!this.contracts.saintRelicsNFT || !this.userAddress) {
            return 0;
        }

        try {
            const balance = await this.contracts.saintRelicsNFT.methods.balanceOf(this.userAddress).call();
            return parseInt(balance);
        } catch (err) {
            error('Failed to get NFT balance:', err);
            return 0;
        }
    }

    /**
     * Get user's NFTs
     */
    async getUserNFTs() {
        if (!this.contracts.saintRelicsNFT || !this.userAddress) {
            return [];
        }

        try {
            const balance = await this.getNFTBalance();
            const nfts = [];

            for (let i = 0; i < balance; i++) {
                const tokenId = await this.contracts.saintRelicsNFT.methods.tokenOfOwnerByIndex(this.userAddress, i).call();
                const details = await this.contracts.saintRelicsNFT.methods.getRelicDetails(tokenId).call();

                nfts.push({
                    tokenId: parseInt(tokenId),
                    saintName: details[0],
                    category: parseInt(details[1]),
                    classification: parseInt(details[2]),
                    status: parseInt(details[3]),
                    spiritualPower: parseInt(details[4]),
                    isResurrected: details[5],
                    location: details[6],
                    ancestorLineage: details[7]
                });
            }

            return nfts;
        } catch (err) {
            error('Failed to get user NFTs:', err);
            return [];
        }
    }

    /**
     * Make a prayer offering (burn tokens)
     */
    async makePrayerOffering(amount) {
        if (!this.contracts.godToken || !this.userAddress) {
            throw new Error('Wallet not connected or contract not available');
        }

        try {
            const amountWei = this.web3.utils.toWei(amount.toString(), 'ether');

            // Check balance
            const balance = await this.contracts.godToken.methods.balanceOf(this.userAddress).call();
            if (parseInt(balance) < parseInt(amountWei)) {
                throw new Error('Insufficient GOD token balance');
            }

            // Burn tokens as offering
            const tx = await this.contracts.godToken.methods.burn(amountWei).send({
                from: this.userAddress
            });

            info(`Prayer offering made: ${amount} GOD tokens`, tx);

            // Update balance display
            await this.updateTokenBalance();

            // Grant divine rewards
            await this.grantDivineRewards(amount);

            return tx;
        } catch (err) {
            error('Failed to make prayer offering:', err);
            throw err;
        }
    }

    /**
     * Resurrect a saint NFT
     */
    async resurrectSaint(tokenId) {
        if (!this.contracts.saintRelicsNFT || !this.userAddress) {
            throw new Error('Wallet not connected or contract not available');
        }

        try {
            const tx = await this.contracts.saintRelicsNFT.methods.resurrectSaint(tokenId).send({
                from: this.userAddress
            });

            info(`Saint resurrected: Token ID ${tokenId}`, tx);

            // Update NFT display
            await this.updateNFTDisplay();

            return tx;
        } catch (err) {
            error('Failed to resurrect saint:', err);
            throw err;
        }
    }

    /**
     * Grant divine rewards for offerings
     */
    async grantDivineRewards(offeringAmount) {
        try {
            // Calculate rewards based on offering amount
            const rewards = this.calculateDivineRewards(offeringAmount);

            // Update user profile with rewards
            const userProfile = appState.getCurrentUser();
            if (userProfile) {
                userProfile.divineRewards = (userProfile.divineRewards || 0) + rewards.points;
                userProfile.spiritualLevel = Math.min(100, (userProfile.spiritualLevel || 1) + rewards.levelIncrease);
                appState.updateUser(userProfile);
            }

            // Show reward notification
            this.showRewardNotification(rewards);

            info(`Divine rewards granted: ${rewards.points} points, +${rewards.levelIncrease} spiritual level`);
        } catch (err) {
            error('Failed to grant divine rewards:', err);
        }
    }

    /**
     * Calculate divine rewards
     */
    calculateDivineRewards(offeringAmount) {
        // Rewards scale with offering amount
        const basePoints = offeringAmount * 10; // 10 points per GOD token
        const levelIncrease = Math.floor(offeringAmount / 10); // 1 level per 10 tokens

        return {
            points: basePoints,
            levelIncrease: levelIncrease,
            blessings: [
                'Divine favor increased',
                'Spiritual power enhanced',
                'Cosmic alignment improved'
            ]
        };
    }

    /**
     * Update connection status in UI
     */
    updateConnectionStatus() {
        const statusElement = document.getElementById('wallet-status');
        if (statusElement) {
            if (this.isConnected && this.userAddress) {
                const shortAddress = `${this.userAddress.slice(0, 6)}...${this.userAddress.slice(-4)}`;
                statusElement.innerHTML = `
                    <div class="wallet-connected">
                        <span class="wallet-icon">🔗</span>
                        <span class="wallet-address">${shortAddress}</span>
                        <button id="disconnect-wallet" class="disconnect-btn">Disconnect</button>
                    </div>
                `;

                // Add disconnect event listener
                document.getElementById('disconnect-wallet')?.addEventListener('click', () => {
                    this.disconnectWallet();
                });
            } else {
                statusElement.innerHTML = `
                    <button id="connect-wallet" class="connect-wallet-btn">
                        <span class="wallet-icon">🔓</span>
                        Connect Wallet
                    </button>
                `;

                // Add connect event listener
                document.getElementById('connect-wallet')?.addEventListener('click', () => {
                    this.connectWallet();
                });
            }
        }
    }

    /**
     * Update token balance display
     */
    async updateTokenBalance() {
        const balanceElement = document.getElementById('god-token-balance');
        if (balanceElement) {
            const balance = await this.getTokenBalance();
            balanceElement.textContent = `${balance} GOD`;
        }
    }

    /**
     * Update NFT display
     */
    async updateNFTDisplay() {
        const nftContainer = document.getElementById('user-nfts');
        if (nftContainer) {
            const nfts = await this.getUserNFTs();

            if (nfts.length === 0) {
                nftContainer.innerHTML = '<p>No Saint Relics owned yet.</p>';
                return;
            }

            const nftHtml = nfts.map(nft => `
                <div class="nft-card" data-token-id="${nft.tokenId}">
                    <div class="nft-header">
                        <h4>${nft.saintName}</h4>
                        <span class="nft-status ${nft.isResurrected ? 'resurrected' : 'dormant'}">
                            ${nft.isResurrected ? '✨ Resurrected' : '💤 Dormant'}
                        </span>
                    </div>
                    <div class="nft-details">
                        <p><strong>Category:</strong> ${this.getCategoryName(nft.category)}</p>
                        <p><strong>Class:</strong> ${this.getClassName(nft.classification)}</p>
                        <p><strong>Power:</strong> ${nft.spiritualPower}</p>
                        <p><strong>Location:</strong> ${nft.location}</p>
                    </div>
                    ${!nft.isResurrected ? `
                        <button class="resurrect-btn" data-token-id="${nft.tokenId}">
                            Resurrect Saint
                        </button>
                    ` : ''}
                </div>
            `).join('');

            nftContainer.innerHTML = nftHtml;

            // Add resurrection event listeners
            document.querySelectorAll('.resurrect-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const tokenId = e.target.dataset.tokenId;
                    try {
                        await this.resurrectSaint(tokenId);
                        DOMHelpers.showNotification('Saint resurrected successfully!', 'success');
                    } catch (err) {
                        DOMHelpers.showNotification('Failed to resurrect saint: ' + err.message, 'error');
                    }
                });
            });
        }
    }

    /**
     * Show reward notification
     */
    showRewardNotification(rewards) {
        const notification = `
            <div class="divine-reward-notification">
                <h3>🎉 Divine Rewards Granted!</h3>
                <p><strong>+${rewards.points} Divine Points</strong></p>
                <p><strong>+${rewards.levelIncrease} Spiritual Level</strong></p>
                <ul>
                    ${rewards.blessings.map(blessing => `<li>${blessing}</li>`).join('')}
                </ul>
            </div>
        `;

        DOMHelpers.showNotification(notification, 'success', 5000);
    }

    /**
     * Get category name from enum
     */
    getCategoryName(category) {
        const categories = ['Bones', 'Artifacts', 'Manuscripts', 'Holy Items', 'Sacred Grounds'];
        return categories[category] || 'Unknown';
    }

    /**
     * Get class name from enum
     */
    getClassName(classification) {
        const classes = ['Martyr', 'Healer', 'Prophet', 'Teacher', 'Mystic', 'Warrior', 'Builder', 'Ancestor'];
        return classes[classification] || 'Unknown';
    }

    /**
     * Disconnect wallet
     */
    disconnectWallet() {
        this.userAddress = null;
        this.isConnected = false;
        this.updateConnectionStatus();
        this.updateTokenBalance();
        this.updateNFTDisplay();
        info('Wallet disconnected');
    }

    /**
     * Get integration status
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            userAddress: this.userAddress,
            networkId: this.networkId,
            contractsLoaded: Object.keys(this.contracts).length > 0,
            tokenBalance: null, // Will be populated async
            nftBalance: 0 // Will be populated async
        };
    }
}

// Singleton instance
const godTokenIntegration = new GodTokenIntegration();

export default godTokenIntegration;
