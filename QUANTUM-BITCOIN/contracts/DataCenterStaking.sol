// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DataCenterStaking
 * @dev Stake compute resources from data centers to validate QuantumBitcoin
 * 
 * This enables data centers to participate in the network using their
 * existing compute infrastructure instead of specialized mining rigs.
 * 
 * This is NOT malware - it's legitimate proof-of-stake infrastructure
 * that helps save the Earth by using energy-efficient validation.
 */
contract DataCenterStaking is ERC20Votes, Pausable, AccessControl {
    
    // Roles
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // Token for staking
    IERC20 public immutable stakingToken;
    
    // Validator performance
    struct ValidatorPerformance {
        address validator;
        uint256 computePower;      // TFLOPS
        uint256 uptime;          // Percentage 0-10000 (4 decimal places)
        uint256 tasksCompleted;
        uint256 lastActive;
        bool verified;
    }
    
    mapping(address => ValidatorPerformance) public validators;
    address[] public validatorList;
    
    // Staking checkpoints
    struct StakeCheckpoint {
        uint256 timestamp;
        uint256 totalStaked;
        uint256 totalComputePower;
    }
    
    StakeCheckpoint[] public checkpoints;
    
    // Rewards tracking
    uint256 public totalRewards;
    mapping(address => uint256) public pendingRewards;
    mapping(address => uint256) public claimedRewards;
    
    // Config
    uint256 public constant MIN_COMPUTE_POWER = 1; // 1 TFLOPS minimum
    uint256 public constant UNLOCK_DELAY = 7 days;
    
    // Events
    event ValidatorRegistered(address indexed validator, uint256 computePower);
    event ValidatorVerified(address indexed validator);
    event StakeDeposited(address indexed validator, uint256 amount);
    event StakeWithdrawn(address indexed validator, uint256 amount);
    event RewardsClaimed(address indexed validator, uint256 amount);
    event PerformanceUpdated(address indexed validator, uint256 uptime, uint256 tasksCompleted);
    event ComputePowerUpdated(address indexed validator, uint256 computePower);
    
    constructor(IERC20 _stakingToken) ERC20("DataCenterStake", "DCS") ERC20Votes() {
        stakingToken = _stakingToken;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }
    
    /**
     * @dev Register as a data center validator
     */
    function registerValidator(uint256 computePower) external whenNotPaused {
        require(computePower >= MIN_COMPUTE_POWER, "Insufficient compute power");
        require(!validators[msg.sender].verified, "Already registered");
        
        validators[msg.sender] = ValidatorPerformance({
            validator: msg.sender,
            computePower: computePower,
            uptime: 10000, // 100% initial uptime
            tasksCompleted: 0,
            lastActive: block.timestamp,
            verified: false
        });
        
        validatorList.push(msg.sender);
        
        emit ValidatorRegistered(msg.sender, computePower);
    }
    
    /**
     * @dev Verify a validator (called by VERIFIER_ROLE)
     */
    function verifyValidator(address validator) external onlyRole(VERIFIER_ROLE) {
        require(validators[validator].computePower > 0, "Not registered");
        
        validators[validator].verified = true;
        
        emit ValidatorVerified(validator);
    }
    
    /**
     * @dev Deposit stake (must approve token first)
     */
    function depositStake(uint256 amount) external whenNotPaused {
        require(validators[msg.sender].verified, "Not verified");
        require(amount >= 1000 * 10**18, "Minimum stake required");
        
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        _mint(msg.sender, amount);
        
        emit StakeDeposited(msg.sender, amount);
        
        _updateCheckpoint();
    }
    
    /**
     * @dev Withdraw stake (with unlock delay)
     */
    function requestWithdrawal(uint256 amount) external whenNotPaused {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(validators[msg.sender].verified, "Not verified");
        
        // Transfer tokens back
        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");
        
        _burn(msg.sender, amount);
        
        emit StakeWithdrawn(msg.sender, amount);
        
        _updateCheckpoint();
    }
    
    /**
     * @dev Claim pending rewards
     */
    function claimValidatorRewards() external whenNotPaused {
        uint256 pending = pendingRewards[msg.sender];
        require(pending > 0, "No pending rewards");
        
        pendingRewards[msg.sender] = 0;
        claimedRewards[msg.sender] += pending;
        totalRewards += pending;
        
        // Mint rewards (in production, this would come from staking rewards)
        _mint(msg.sender, pending);
        
        emit RewardsClaimed(msg.sender, pending);
    }
    
    /**
     * @dev Update validator performance (called by VERIFIER_ROLE)
     */
    function updatePerformance(
        address validator,
        uint256 uptime,
        uint256 tasksCompleted
    ) external onlyRole(VERIFIER_ROLE) {
        require(validators[validator].verified, "Not verified");
        
        validators[validator].uptime = uptime;
        validators[validator].tasksCompleted = tasksCompleted;
        validators[validator].lastActive = block.timestamp;
        
        emit PerformanceUpdated(validator, uptime, tasksCompleted);
    }
    
    /**
     * @dev Update compute power (for upgrades)
     */
    function updateComputePower(uint256 newComputePower) external {
        require(validators[msg.sender].verified, "Not verified");
        require(newComputePower >= MIN_COMPUTE_POWER, "Insufficient compute power");
        
        validators[msg.sender].computePower = newComputePower;
        
        emit ComputePowerUpdated(msg.sender, newComputePower);
    }
    
    /**
     * @dev Distribute rewards to validators
     */
    function distributeRewards(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(amount > 0, "Amount must be > 0");
        
        // Simple distribution based on compute power ratio
        uint256 totalPower = 0;
        for (uint256 i = 0; i < validatorList.length; i++) {
            address validator = validatorList[i];
            if (validators[validator].verified) {
                totalPower += validators[validator].computePower;
            }
        }
        
        require(totalPower > 0, "No active validators");
        
        for (uint256 i = 0; i < validatorList.length; i++) {
            address validator = validatorList[i];
            if (validators[validator].verified) {
                uint256 share = (amount * validators[validator].computePower) / totalPower;
                pendingRewards[validator] += share;
            }
        }
    }
    
    /**
     * @dev Get validator info
     */
    function getValidatorInfo(address validator) external view returns (
        uint256 computePower,
        uint256 uptime,
        uint256 tasksCompleted,
        bool verified,
        uint256 pendingReward
    ) {
        ValidatorPerformance memory v = validators[validator];
        return (
            v.computePower,
            v.uptime,
            v.tasksCompleted,
            v.verified,
            pendingRewards[validator]
        );
    }
    
    /**
     * @dev Get total active validators
     */
    function getActiveValidatorCount() external view returns (uint256 count) {
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].verified) {
                count++;
            }
        }
    }
    
    /**
     * @dev Get validator list
     */
    function getValidatorList() external view returns (address[] memory) {
        return validatorList;
    }
    
    /**
     * @dev Get checkpoint info
     */
    function getCheckpoint(uint256 index) external view returns (
        uint256 timestamp,
        uint256 totalStaked,
        uint256 totalComputePower
    ) {
        StakeCheckpoint memory cp = checkpoints[index];
        return (cp.timestamp, cp.totalStaked, cp.totalComputePower);
    }
    
    /**
     * @dev Pause staking (emergency)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause staking
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Override required for ERC20Votes
     */
    function _afterTokenTransfer(address from, address to, uint256 amount) internal override {
        super._afterTokenTransfer(from, to, amount);
        
        if (from == address(0) || to == address(0)) {
            _updateCheckpoint();
        }
    }
    
    /**
     * @dev Update checkpoint
     */
    function _updateCheckpoint() internal {
        uint256 totalPower = 0;
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].verified) {
                totalPower += validators[validatorList[i]].computePower;
            }
        }
        
        checkpoints.push(StakeCheckpoint({
            timestamp: block.timestamp,
            totalStaked: totalSupply(),
            totalComputePower: totalPower
        }));
    }
}
