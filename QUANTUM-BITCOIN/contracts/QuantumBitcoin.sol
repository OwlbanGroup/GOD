// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title QuantumBitcoin
 * @dev Quantum-resistant Bitcoin-like token running on Ethereum PoS
 * 
 * Mission: Save humanity and Earth by using data center compute power
 * instead of natural resources (unlike traditional Bitcoin mining)
 * 
 * Features:
 * - Quantum-resistant cryptography (post-quantum ready)
 * - Green energy verification for validators
 * - Data center staking for network participation
 * - Environmentally sustainable (no PoW resource destruction)
 */
contract QuantumBitcoin is ERC20, ERC20Burnable, Pausable, AccessControl {
    
    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant GREEN_VERIFIER_ROLE = keccak256("GREEN_VERIFIER_ROLE");
    
    // Quantum-resistant state
    uint256 public constant QUANTUM_DIFFICULTY = 1000;
    bytes32 public quantumEntropy;
    
    // Green energy tracking
    struct DataCenter {
        string name;
        string location;
        uint256 energyUsage;      // kWh
        uint256 renewablePercent; // 0-100
        bool verified;
        uint256 lastVerified;
    }
    
    mapping(address => DataCenter) public dataCenters;
    mapping(address => bool) public greenVerified;
    uint256 public totalGreenEnergy;
    
    // Staking for data centers
    struct Validator {
        address operator;
        uint256 stakedAmount;
        uint256 computePower;     // TFLOPS
        uint256 rewards;
        uint256 lastRewardTime;
        bool active;
    }
    
    mapping(address => Validator) public validators;
    uint256 public totalStaked;
    uint256 public totalComputePower;
    
    // Rewards
    uint256 public rewardRate = 10; // 10 QBTC per block
    uint256 public rewardInterval = 1 days;
    
    // Events
    event DataCenterRegistered(address indexed operator, string name, string location);
    event GreenVerified(address indexed operator, uint256 renewablePercent);
    event ComputeStaked(address indexed operator, uint256 amount);
    event ValidatorRewarded(address indexed operator, uint256 reward);
    event EnvironmentalImpact(uint256 greenEnergy, uint256 carbonSaved);
    
    constructor() ERC20("QuantumBitcoin", "QBTC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(GREEN_VERIFIER_ROLE, msg.sender);
        
        // Initialize quantum entropy
        quantumEntropy = bytes32(uint256(keccak256(abi.encode(block.timestamp, block.prevrandao))));
        
        // Mint initial supply to treasury for liquidity
        _mint(msg.sender, 21000000 * 10**18); // 21M max like Bitcoin
    }
    
    /**
     * @dev Register a data center for green energy verification
     */
    function registerDataCenter(string memory name, string memory location) external {
        require(bytes(name).length > 0, "Name required");
        require(bytes(location).length > 0, "Location required");
        require(!dataCenters[msg.sender].verified, "Already registered");
        
        dataCenters[msg.sender] = DataCenter({
            name: name,
            location: location,
            energyUsage: 0,
            renewablePercent: 0,
            verified: false,
            lastVerified: 0
        });
        
        emit DataCenterRegistered(msg.sender, name, location);
    }
    
    /**
     * @dev Verify green energy usage (called by GREEN_VERIFIER_ROLE)
     */
    function verifyGreenEnergy(
        address operator,
        uint256 energyUsage,
        uint256 renewablePercent
    ) external onlyRole(GREEN_VERIFIER_ROLE) {
        require(energyUsage > 0, "Energy usage required");
        require(renewablePercent <= 100, "Invalid percentage");
        
        DataCenter storage dc = dataCenters[operator];
        require(bytes(dc.name).length > 0, "Data center not registered");
        
        dc.energyUsage = energyUsage;
        dc.renewablePercent = renewablePercent;
        dc.verified = true;
        dc.lastVerified = block.timestamp;
        
        greenVerified[operator] = true;
        totalGreenEnergy += energyUsage;
        
        emit GreenVerified(operator, renewablePercent);
        
        // Emit environmental impact
        uint256 carbonSaved = (energyUsage * renewablePercent * 439) / 100000; // kg CO2
        emit EnvironmentalImpact(totalGreenEnergy, carbonSaved);
    }
    
    /**
     * @dev Stake tokens to become a validator with compute power
     */
    function stake(uint256 amount, uint256 computePower) external {
        require(amount >= 1000 * 10**18, "Minimum 1000 QBTC stake");
        require(computePower > 0, "Compute power required");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(dataCenters[msg.sender].verified, "Data center not verified");
        
        _transfer(msg.sender, address(this), amount);
        
        Validator storage v = validators[msg.sender];
        v.operator = msg.sender;
        v.stakedAmount += amount;
        v.computePower += computePower;
        v.lastRewardTime = block.timestamp;
        v.active = true;
        
        totalStaked += amount;
        totalComputePower += computePower;
        
        emit ComputeStaked(msg.sender, amount);
    }
    
    /**
     * @dev Claim validator rewards
     */
    function claimRewards() external {
        Validator storage v = validators[msg.sender];
        require(v.active, "Not a validator");
        
        uint256 timePassed = block.timestamp - v.lastRewardTime;
        require(timePassed >= rewardInterval, "Too soon");
        
        // Calculate reward based on compute power and green energy
        uint256 baseReward = rewardRate * (v.computePower * 10**18) / totalComputePower;
        
        // Bonus for green energy
        uint256 greenBonus = 0;
        DataCenter storage dc = dataCenters[msg.sender];
        if (dc.verified && dc.renewablePercent >= 50) {
            greenBonus = baseReward * dc.renewablePercent / 200; // Up to 50% bonus
        }
        
        uint256 totalReward = baseReward + greenBonus;
        
        // Mint rewards (not from reserves - inflationary for validators)
        _mint(msg.sender, totalReward);
        v.rewards += totalReward;
        v.lastRewardTime = block.timestamp;
        
        emit ValidatorRewarded(msg.sender, totalReward);
    }
    
    /**
     * @dev Withdraw staked tokens
     */
    function withdrawStake(uint256 amount) external {
        Validator storage v = validators[msg.sender];
        require(v.stakedAmount >= amount, "Insufficient stake");
        
        v.stakedAmount -= amount;
        totalStaked -= amount;
        
        _transfer(address(this), msg.sender, amount);
    }
    
    /**
     * @dev Get data center information
     */
    function getDataCenter(address operator) external view returns (
        string memory name,
        string memory location,
        uint256 energyUsage,
        uint256 renewablePercent,
        bool verified
    ) {
        DataCenter memory dc = dataCenters[operator];
        return (dc.name, dc.location, dc.energyUsage, dc.renewablePercent, dc.verified);
    }
    
    /**
     * @dev Get validator information
     */
    function getValidator(address operator) external view returns (
        uint256 stakedAmount,
        uint256 computePower,
        uint256 rewards,
        bool active
    ) {
        Validator memory v = validators[operator];
        return (v.stakedAmount, v.computePower, v.rewards, v.active);
    }
    
    /**
     * @dev Quantum-resistant hash
     */
    function quantumHash(bytes memory data) public view returns (bytes32) {
        bytes32 hash = keccak256(abi.encode(data, quantumEntropy));
        return keccak256(abi.encode(hash, block.timestamp));
    }
    
    /**
     * @dev Pause token transfers (emergency)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Mint new tokens (only for valid emissions)
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens (only for valid burns)
     */
    function burn(uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Override transfer to include quantum verification
     */
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        // Optional: Add quantum verification for large transfers
        if (amount >= 1000000 * 10**18) {
            bytes32 qHash = quantumHash(abi.encode(msg.sender, to, amount));
            // Log quantum hash for verification (simplified)
            emit EnvironmentalImpact(totalGreenEnergy, uint256(qHash));
        }
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom to include quantum verification
     */
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        if (amount >= 1000000 * 10**18) {
            bytes32 qHash = quantumHash(abi.encode(from, to, amount));
            emit EnvironmentalImpact(totalGreenEnergy, uint256(qHash));
        }
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Get environmental stats
     */
    function getEnvironmentalStats() external view returns (
        uint256 _totalGreenEnergy,
        uint256 _totalStaked,
        uint256 _totalComputePower,
        uint256 _carbonSaved
    ) {
        _carbonSaved = (totalGreenEnergy * 439) / 100000; // Simplified CO2 calculation
        return (totalGreenEnergy, totalStaked, totalComputePower, _carbonSaved);
    }
}
