// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DailyCheckIn {
    mapping(address => uint256) public lastCheckInTime;
    event CheckedIn(address indexed user, uint256 timestamp);

    function checkIn() external {
        // Basic check to ensure not checking in too fast (optional, frontend handles day logic)
        // For strict on-chain daily enforcement, we'd need day calculation, 
        // but for this simple verification, we just record the timestamp.
        
        lastCheckInTime[msg.sender] = block.timestamp;
        emit CheckedIn(msg.sender, block.timestamp);
    }
}
