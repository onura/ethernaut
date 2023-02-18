// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/DoubleEntryPoint.sol";
import "../src/DoubleEntryPointSolution.sol";

// anvil -f $GOERLI_RPC_URL --fork-block-number 8512137
// forge script script/DoubleEntryPoint.s.sol:DoubleEntryPointSolution --fork-url http://127.0.0.1:8545 --broadcast -vvv

contract DoubleEntryPointSolution is Script {
    address internal constant LEGACY_ADDR = 0x0B504017e7950ce5C002cF3983eDa10Ac0D823C5;
    address internal constant DOUBLE_ENT_ADDR = 0xDb9c42DD6bFf1af89fcD9A02A2D9145e8F69804A;

    DoubleEntryPoint public dep;
    CryptoVault public vault;
    Forta public forta;
    DoubleEntryPointSolution public solution;

    function setup() {
        dep = DoubleEntryPoint(DOUBLE_ENT_ADDR);
        vault = CryptoVault(dep.cryptoVault());
        forta = Forta(dep.forta());
        solution = new DoubleEntryPointSolution(address(forta));
    }
    
    function run() {
        uint256 attackerPK = vm.envUint("ANVIL_PRIVATE_KEY");
        //uint256 attackerPK = vm.envUint("PRIVATE_KEY");

        vm.broadcast(attackerPK);
        forta.setDetectionBot(address(solution));
        vault.sweepToken(LEGACY_ADDR);

        vm.stopBroadcast();
    }
}