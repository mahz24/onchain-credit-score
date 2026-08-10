// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";
import {CreditScore} from "../src/CreditScore.sol";

contract DeployCreditScore is Script {
    function run() external returns (CreditScore) {
        vm.startBroadcast();
        CreditScore creditScore = new CreditScore();
        vm.stopBroadcast();

        return creditScore;
    }
}