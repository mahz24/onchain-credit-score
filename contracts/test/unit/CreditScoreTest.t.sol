// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test} from "forge-std/Test.sol";
import {CreditScore} from "../../src/CreditScore.sol";

contract CreditScoreTest is Test {
    CreditScore public creditScore;
    address public user = makeAddr("user");

    function setUp() public {
        creditScore = new CreditScore();
    }

    function testNewUserWithZeroBalanceGetsMinimalScore() public {
        vm.prank(user);
        creditScore.updateMyScore();
        (uint256 score,,,) = creditScore.profiles(user);
        assertEq(score, 5);
    }

    function testScoreAfterAgeCapReached() public {
        vm.prank(user);
        creditScore.updateMyScore();
        // Simulate the user being seen for a long time
        vm.roll(block.number + 2_160_000); // Move forward in blocks to reach age cap
        vm.prank(user);
        creditScore.updateMyScore();

        (uint256 score,,,) = creditScore.profiles(user);
        assertEq(score, 360);
    }

    function testScoreWithPartialBalance() public {
        vm.deal(user, 5 ether); // Give the user 5 ether

        vm.prank(user);
        creditScore.updateMyScore();

        (uint256 score,,,) = creditScore.profiles(user);
        assertEq(score, 205); // 5 ether should give half of the balance points
    }

    function testScoreWithMaxBalance() public {
        vm.deal(user, 10 ether); // Give the user 10 ether

        vm.prank(user);
        creditScore.updateMyScore();

        (uint256 score,,,) = creditScore.profiles(user);
        assertEq(score, 405); // 10 ether should give full balance points
    }

    function testScoreWithMoreThanMaxBalance() public {
        vm.deal(user, 15 ether); // Give the user 15 ether

        vm.prank(user);
        creditScore.updateMyScore();

        (uint256 score,,,) = creditScore.profiles(user);
        assertEq(score, 405); // More than 10 ether should still give full balance points
    }

    function testOnlyOwnerCanForceUpdateScore() public {
        vm.prank(user);
        vm.expectRevert();
        creditScore.forceUpdateScore(user);
    }

    function testOwnerCanForceUpdateScore() public {
        address owner = address(this);
        vm.prank(owner);
        creditScore.forceUpdateScore(user);

        (uint256 score,,,) = creditScore.profiles(user);
        assertEq(score, 5); // The score should be updated to the minimal score
    }
}
