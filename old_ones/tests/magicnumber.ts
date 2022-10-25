import { ethers } from "hardhat";
import { expect } from "chai";

describe("magicnumber", function() {
    it("Should solve magic number challenge", async function(){ 
        this.timeout(0);

        // setup & check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);

        // define target abi's necessary parts
        const targetABI = [
            "function setSolver(address _solver) public",
        ]
        const targetAddr = "0xdC6c788092Aad0561c105e02BECC2c5E29B78101";

        let targetCont = new ethers.Contract(targetAddr, targetABI, ethers.getDefaultProvider());
        targetCont = targetCont.connect(eoa);

        /* useful tool: https://github.com/crytic/pyevmasm/tree/master/pyevmasm
         * basically, this is a contract returning 42 (0x2a) to all function calls. 
         * push1 0x2a
         * push1 0x50
         * mstore
         * push1 0x20
         * push1 0x50
         * return
         * 602a60505260206050f3
         * 
         * this is contract initialization code for a 10 bytes long contract
         * 600a600c600039600a6000f3
         *
         * this is the concatenated version and a valid contract creation bytecode 
         * 0x600a600c600039600a6000f3602a60505260206050f3 
         */ 
        
        // contract creation is a transaction with only from and data fields specified
        const bytecode = "0x600a600c600039600a6000f3602a60505260206050f3";
        let tx = await eoa.sendTransaction({
            from: eoa.address,
            data: bytecode,
        });
        await tx.wait();
        console.log(tx);

        // get our tiny contract's address
        let txReceipt = await eoa.provider!.getTransactionReceipt(tx.hash);
        const tinyContAddr = txReceipt.contractAddress;
        expect(tinyContAddr).to.be.not.null;

        // test our tiny contract
        let tinyCont = new ethers.Contract(
            tinyContAddr,
            ["function whatIsTheMeaningOfLife() external view returns (uint256)"],
            ethers.getDefaultProvider()
            ).connect(eoa);
        
        let testVal = await tinyCont.whatIsTheMeaningOfLife();
        expect(testVal).to.eq(42); 

        tx = await targetCont.setSolver(tinyContAddr);
        await tx.wait();
        console.log(tx);
    });
});