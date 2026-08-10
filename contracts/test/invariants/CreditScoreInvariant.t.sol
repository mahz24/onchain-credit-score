// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test} from "forge-std/Test.sol";
import {CreditScore} from "../../src/CreditScore.sol";
import {CreditScoreHandler} from "../handlers/CreditScoreHandler.sol";

contract CreditScoreInvariantTest is Test {
    CreditScore public creditScore;
    CreditScoreHandler public handler;

    function setUp() public {
        creditScore = new CreditScore();
        handler = new CreditScoreHandler(creditScore);
        targetContract(address(handler)); // le dice a Foundry: llama funciones AQUÍ, no en CreditScore directo
    }

    function invariantScoreNeverExceedsMax() public view {
        for (uint256 i = 0; i < handler.getActors().length; i++) {
            (uint256 score, , , ) = creditScore.profiles(handler.getActors()[i]);
            assertLe(score, 1000);
        }
    }
}