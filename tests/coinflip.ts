import { ethers } from "hardhat";
import { expect } from "chai";

describe("coin flip", function() {
    it("Should solve coin flip challenge", async function(){ 
        this.timeout(0);

        // setup & check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);

        // define target abi's necessary parts
        const targetABI = [
            "function consecutiveWins() public view returns (uint256)",
        ]
        const targetAddr = "0x5513cFa28772F9b54f2F9222D0237B39feAD3EE7";

        const proxyFactory = await ethers.getContractFactory("CoinFlipProxy");
        const proxyCont = await proxyFactory.deploy(targetAddr);
        
        // wait for it to be deployed
        await eoa.provider!.waitForTransaction(proxyCont.deployTransaction.hash);

        let targetCont = new ethers.Contract(targetAddr, targetABI, ethers.getDefaultProvider());
        targetCont = targetCont.connect(eoa);

        let winCount = await targetCont.consecutiveWins();
        console.log(winCount);

        while(winCount < 10) {
            let tx = await proxyCont.guess();
            await tx.wait();
            winCount = await targetCont.consecutiveWins();
            console.log(winCount);
        }

        expect(winCount).gte(10);
    });
});