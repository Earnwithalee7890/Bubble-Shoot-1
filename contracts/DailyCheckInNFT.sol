// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DailyCheckInNFT is ERC1155, Ownable {
    using Strings for uint256;

    string public name = "Bubble Shoot Daily Check-In";
    string public symbol = "BSDC";
    
    // Mapping to track if a user has minted a specific daily ID
    mapping(uint256 => mapping(address => bool)) public hasMintedDay;

    constructor() ERC1155("https://bubble-shoot-game.vercel.app/api/metadata/{id}") Ownable(msg.sender) {}

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        require(!hasMintedDay[id][account], "Already minted for this day");
        hasMintedDay[id][account] = true;
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }

    // Helper to check if user has checked in for a specific day ID (YYYYMMDD)
    function hasCheckedIn(address user, uint256 dayId) public view returns (bool) {
        return hasMintedDay[dayId][user];
    }
}
