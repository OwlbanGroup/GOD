// GOD Token Integration for Direct Contact with God
// Handles wallet connection, balance retrieval, and token offerings

class GodTokenManager {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.userAddress = null;

        // GOD Token contract address (placeholder - replace with deployed address)
        this.contractAddress = '0x0000000000000000000000000000000000000000'; // Replace with actual deployed contract

        // GOD Token ABI (simplified)
        this.contractABI = [
            "function balanceOf(address owner) view returns (uint256)",
            "function transfer(address to, uint256 amount) returns (bool)",
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)",
            "function name() view returns (string)"
        ];

        this.init();
    }

    async init() {
        if (typeof window.ethereum !== 'undefined') {
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
        }
    }

    async connectWallet() {
        try {
            if (!this.provider) {
                throw new Error('MetaMask not detected. Please install MetaMask to connect your wallet.');
            }

            await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.signer = this.provider.getSigner();
            this.userAddress = await this.signer.getAddress();

            // Initialize contract
            this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.signer);

            // Update UI
            this.updateWalletInfo();

            return { success: true, address: this.userAddress };
        } catch (error) {
            console.error('Wallet connection failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getBalance() {
        try {
            if (!this.contract || !this.userAddress) {
                return '0';
            }

            const balance = await this.contract.balanceOf(this.userAddress);
            const decimals = await this.contract.decimals();
            const formattedBalance = ethers.utils.formatUnits(balance, decimals);

            return formattedBalance;
        } catch (error) {
            console.error('Failed to get balance:', error);
            return '0';
        }
    }

    async makeOffering(amount) {
        try {
            if (!this.contract || !this.userAddress) {
                throw new Error('Wallet not connected');
            }

            // Divine treasury address (placeholder - replace with actual treasury address)
            const treasuryAddress = '0x0000000000000000000000000000000000000000'; // Replace with divine treasury

            const decimals = await this.contract.decimals();
            const amountInWei = ethers.utils.parseUnits(amount.toString(), decimals);

            // Check balance
            const balance = await this.contract.balanceOf(this.userAddress);
            if (balance.lt(amountInWei)) {
                throw new Error('Insufficient GOD token balance');
            }

            // Make the transfer
            const tx = await this.contract.transfer(treasuryAddress, amountInWei);
            await tx.wait();

            // Update balance
            this.updateWalletInfo();

            return { success: true, txHash: tx.hash };
        } catch (error) {
            console.error('Offering failed:', error);
            return { success: false, error: error.message };
        }
    }

    async updateWalletInfo() {
        const walletAddressElement = document.getElementById('walletAddress');
        const godBalanceElement = document.getElementById('godBalance');

        if (this.userAddress) {
            const shortAddress = `${this.userAddress.slice(0, 6)}...${this.userAddress.slice(-4)}`;
            walletAddressElement.textContent = shortAddress;

            const balance = await this.getBalance();
            godBalanceElement.textContent = `GOD Balance: ${parseFloat(balance).toFixed(4)}`;
        } else {
            walletAddressElement.textContent = 'Not connected';
            godBalanceElement.textContent = 'GOD Balance: 0';
        }
    }

    isConnected() {
        return this.userAddress !== null;
    }
}

// Global instance
const godTokenManager = new GodTokenManager();

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const connectWalletBtn = document.getElementById('connectWallet');
    const makeOfferingBtn = document.getElementById('makeOffering');
    const offeringAmountInput = document.getElementById('offeringAmount');
    const offeringStatus = document.getElementById('offeringStatus');

    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', async () => {
            const result = await godTokenManager.connectWallet();
            if (result.success) {
                connectWalletBtn.textContent = '✅ Wallet Connected';
                connectWalletBtn.disabled = true;
            } else {
                alert('Failed to connect wallet: ' + result.error);
            }
        });
    }

    if (makeOfferingBtn) {
        makeOfferingBtn.addEventListener('click', async () => {
            const amount = parseFloat(offeringAmountInput.value);
            if (!amount || amount <= 0) {
                offeringStatus.textContent = 'Please enter a valid offering amount.';
                offeringStatus.style.color = 'red';
                return;
            }

            if (!godTokenManager.isConnected()) {
                offeringStatus.textContent = 'Please connect your wallet first.';
                offeringStatus.style.color = 'red';
                return;
            }

            makeOfferingBtn.disabled = true;
            makeOfferingBtn.textContent = 'Processing...';

            const result = await godTokenManager.makeOffering(amount);

            if (result.success) {
                offeringStatus.textContent = `Divine offering of ${amount} GOD tokens successful! Transaction: ${result.txHash}`;
                offeringStatus.style.color = 'green';
                offeringAmountInput.value = '';
            } else {
                offeringStatus.textContent = 'Offering failed: ' + result.error;
                offeringStatus.style.color = 'red';
            }

            makeOfferingBtn.disabled = false;
            makeOfferingBtn.textContent = '🙏 Make Divine Offering';
        });
    }
});

// Export for use in other scripts
window.GodTokenManager = GodTokenManager;
window.godTokenManager = godTokenManager;
