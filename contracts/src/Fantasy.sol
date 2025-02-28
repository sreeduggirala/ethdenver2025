// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Fantasy {
	address public authority;

	struct Team {
		address[5] members;
	}

	mapping(address => string[5]) public drafts;
	mapping(uint256 => Team) public teams;
	mapping(string => uint256) public prices;
	mapping(address => uint256) public balances;

	event TeamCreated(uint256 id, address creator);
	event PlayerJoined(address player, uint256 id);
	event Drafted(address player, string kol, uint256 index);
	event PriceUpdated(string kol, uint256 price);

	constructor() {
		authority = msg.sender;
	}

	modifier onlyAuthority() {
		require(msg.sender == authority, "Unauthorized user");
		_;
	}

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
		for(uint256 i = 0; i < 5; i++) {
			if (team.members[i] == address(0)) {
				team.members[i] = msg.sender;
				for(uint256 i = 0; i < 5; i++) {
					draft[msg.sender][i] = "";
				}
				joined = true;
				emit PlayerJoined(msg.sender, id);
				break;
			}
		}
		require(joined, "Team is already full");
	}

	function draft(address player, string memory kol, uint256 index) public {
		require(index < 5, "Index must be less than 5");
		uint256 price = 10;
		if(prices[kol] > 0) {
			price = prices[kol];
		}
		require(balances[player] >= price, "Insufficient funds");
		balances[player] -= price;
		drafts[player][index] = kol;
		emit Drafted(player, kol, index);
	}

	function setAuthority(address updatedAuthority) public onlyAuthority {
		authority = updatedAuthority;
	}

	function setPrice(string memory kol, uint256 price) public onlyAuthority {
		prices[kol] = price;
		emit PriceUpdated(kol, price);
	}

	function getMembersFromTeam(uint256 id) public view returns (address[5] memory) {
		return teams[id].members;
	}

	function getDraft(address player) public view returns (string[5] memory) {
		return drafts[player];
	}

	function getPrice(string memory kol) public view returns (uint256) {
		uint256 price = 10;
		if(prices[kol] > 0) {
			price = prices[kol];
		}
		return price;
	}
}