// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/DoubleEntryPoint.sol";

// anvil -f $GOERLI_RPC_URL --fork-block-number 8512137
// forge script script/DoubleEntryPoint.s.sol:DoubleEntryPointSolution --fork-url http://127.0.0.1:8545 --broadcast -vvv

contract DoubleEntryPointSolution is Script {
    address internal constant LEGACY_ADDR = 0xB508405BE25B95ba3e02dC7bc0F0B316cce8c838;
    address internal constant DOUBLE_ENT_ADDR = 0x5C5BB6030B6579701CD38b4CDD84C2c0cd57a57e;

    DoubleEntryPoint public dep;
    CryptoVault public vault;
    Forta public forta;
    DetectionBot public bot;

    function setUp() public {
        dep = DoubleEntryPoint(DOUBLE_ENT_ADDR);
        vault = CryptoVault(dep.cryptoVault());
        forta = Forta(dep.forta());
    }
    
    /*
     * Cryptovault's sweepToken function tries to prevent transferring underlying
     * token by a require check. However, it accepts and ERC20 token and calls its' transfer function.
     * LegacyToken's transfer function calls the DoubleEntryPoint which is the underlying token's 
     * delegateTransfer function. If an attacker calls the sweepToken with LegacyToken argument argument,
     * Cyrptovault gracefully transfers the residual underlying tokens to the sweptTokenRecipient.
     */
    function run() public {
        //uint256 attackerPK = vm.envUint("ANVIL_PRIVATE_KEY");
        uint256 attackerPK = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(attackerPK);

        // Deploy the detection bot
        bot = new DetectionBot(address(forta), vault.sweptTokensRecipient());
        
        // Register the detection bot
        forta.setDetectionBot(address(bot));
        
        // Trigger sweepToken vulnerability to test the bot
        //vault.sweepToken(IERC20(LEGACY_ADDR));

        vm.stopBroadcast();
    }
}

contract DetectionBot is IDetectionBot {

    IForta private forta;
    address sweepReceiver;

    constructor (address fortaAddr, address _sweepReceiver) {
        forta = IForta(fortaAddr);
        sweepReceiver = _sweepReceiver;
    }

    function handleTransaction(address user, bytes calldata msgData) override external {
        address to;
        uint256 value;
        address origSender;
        (to, value, origSender) = abi.decode(msgData[4:],(address,uint256,address));

        // Underlying token should not be transferred to sweepTokenRecipient 
        if (to == sweepReceiver) {
            forta.raiseAlert(user);
        }
    }
}