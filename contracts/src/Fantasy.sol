// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Fantasy {
	mapping(address => string[5]) public drafts;

	struct Team {
		address[5] members;
	}

	mapping(uint256 => Team) public teams;

	event TeamCreated(uint256 id, address creator);
	event PlayerJoined(address player, uint256 id);
	event Drafted(address player, string kol, uint256 index);

	function createTeam() public returns (uint256) {
		uint256 id = uint256(keccak256(abi.encodePacked(msg.sender, block.timestamp)));
		Team storage team = teams[id];
		team.members[0] = msg.sender;
		emit TeamCreated(id, msg.sender);
		return id;
	}

	function join(uint256 id) public {
		Team storage team = teams[id];
		bool joined = false;
		for (uint256 i = 0; i < 5; i++) {
			if (team.members[i] == address(0)) {
				team.members[i] = msg.sender;
				joined = true;
				emit PlayerJoined(msg.sender, id);
				break;
			}
		}
		require(joined, "The team is full");
	}

	function draft(address player, string memory kol, uint256 index) public {
		require(index < 5, "Index must be less than 5");
		drafts[player][index] = kol;
		emit Drafted(player, kol, index);
	}
}