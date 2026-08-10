// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

contract CreditScore is Ownable {
    struct CreditProfile {
        uint256 score; // 0-1000
        uint256 lastUpdated; // timestamp last time the score was updated
        uint256 firstSeenBlock; // block number when the user was first seen
        uint256 interactionCount; // number of interactions the user has had with the system
    }

    uint256 private constant BALANCE_CAP = 10 ether;
    uint256 private constant AGE_CAP = 2_160_000;
    uint256 private constant ACTIVITY_CAP = 50;

    mapping(address => CreditProfile) public profiles;

    event ScoreCalculated(address indexed user, uint256 score, uint256 timestamp);

    constructor() Ownable(msg.sender) {
        // Initialize the contract
    }

    function updateMyScore() external {
        _updateProfile(msg.sender);
    }

    function forceUpdateScore(address user) external onlyOwner {
        _updateProfile(user);
    }

    // Internal functions

    function _calculateScore(address user) internal view returns (uint256) {
        uint256 balancePoints = Math.min(user.balance, BALANCE_CAP) * 400 / BALANCE_CAP;
        uint256 agePoints = Math.min(block.number - profiles[user].firstSeenBlock, AGE_CAP) * 350 / AGE_CAP;
        uint256 activityPoints = Math.min(profiles[user].interactionCount, ACTIVITY_CAP) * 250 / ACTIVITY_CAP;
        return balancePoints + agePoints + activityPoints;
    }

    function _updateProfile(address user) internal {
        CreditProfile storage profile = profiles[user];

        // If the user is new, initialize their profile
        if (profile.firstSeenBlock == 0) {
            profile.firstSeenBlock = block.number;
        }

        // Update the interaction count
        profile.interactionCount += 1;

        // Calculate the new score
        uint256 newScore = _calculateScore(user);
        profile.score = newScore;
        profile.lastUpdated = block.timestamp;

        emit ScoreCalculated(user, newScore, block.timestamp);
    }
}
