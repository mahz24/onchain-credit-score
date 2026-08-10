
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test} from "forge-std/Test.sol";
import {CreditScore} from "../../src/CreditScore.sol";

// test/handlers/CreditScoreHandler.sol
contract CreditScoreHandler is Test {
    CreditScore public creditScore;
    address[] private actors;

    constructor(CreditScore _creditScore) {
        creditScore = _creditScore;
        actors.push(makeAddr("actor1"));
        actors.push(makeAddr("actor2"));
        actors.push(makeAddr("actor3"));
    }

    function updateMyScore(uint256 actorSeed, uint256 balanceSeed) public {
        address actor = actors[bound(actorSeed, 0, actors.length - 1)];
        uint256 balance = bound(balanceSeed, 0, 1000 ether);

        vm.deal(actor, balance);
        vm.prank(actor);
        creditScore.updateMyScore();
    }

    function getActors() public view returns (address[] memory) {
        return actors;
    }
}