// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/console.sol";

interface IDetectionBot {
    function handleTransaction(address user, bytes calldata msgData) external;
}

interface IForta {
    function setDetectionBot(address detectionBotAddress) external;
    function notify(address user, bytes calldata msgData) external;
    function raiseAlert(address user) external;
}

contract DetectionBot is IDetectionBot {

    IForta private forta; 
    constructor (address fortaAddr) {
        forta = IForta(fortaAddr);
    }

    function handleTransaction(address user, bytes calldata msgData) external {
        console.log(user);
        console.logBytes(msgData);
    }
}