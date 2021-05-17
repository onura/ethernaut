pragma solidity ^0.8.4;

contract ForceProxy {
    constructor(address payable _targetAddr) payable {
        require(msg.value > 0);
        selfdestruct(_targetAddr);
    }
}