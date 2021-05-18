import { ethers } from "hardhat";
import { expect } from "chai";


describe("gatekeepertwo", function() {
    it("should solve Gate Keeper Two challenge", async function() {
        this.timeout(0);

        // setup & check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);

        let targetABI = [
            "function entrant() public view returns (address)",
        ];

        const targetAddr = "0x240E9e8E4D00B1BF41F715133FCf88Cd0FCF5E7a";
        let targetCont = new ethers.Contract(targetAddr, targetABI, ethers.getDefaultProvider());
        targetCont = targetCont.connect(eoa);
        
        // gateone is ok (tx.origin != msg.sender)
        const proxyFactory = await ethers.getContractFactory("GKTProxy");
        const proxyCont = await proxyFactory.deploy(targetAddr, { gasLimit: 555555 });
        await eoa.provider!.waitForTransaction(proxyCont.deployTransaction.hash);
        console.log("GKTProxy deployed at: " + proxyCont.address);

        const entrant = await targetCont.entrant();
        expect(entrant).to.eq(eoa.address);
    });
});