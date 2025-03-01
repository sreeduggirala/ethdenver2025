// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
	function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
	function transfer(address to, uint256 value) external returns (bool);
}

contract Fantasy {
	address public authority;
	address public token = 0xCfd748B9De538c9f5b1805e8db9e1d4671f7F2ec;
	uint256 counter = 0;
	// address public token = 0x866386C7f4F2A5f46C5F4566D011dbe3e8679BE4;

	struct Team {
		address[5] members;
		uint256[5] funds;
		uint256[5] prizes;
	}

	mapping(address => string[5]) public drafts;
	mapping(uint256 => Team) public teams;
	mapping(string => uint256) public prices;
	mapping(address => uint256) public balances;

	event TeamCreated(uint256 id, address creator);
	event PlayerJoined(address player, uint256 id);
	event Drafted(address player, string kol, uint256 index);
	event PriceUpdated(string kol, uint256 price);
	event PrizeIssued(uint256 id, address player, uint256 amount);
	event PrizeClaimed(uint256 id, address player, uint256 amount);

	constructor() {
		authority = msg.sender;
	}

	modifier onlyAuthority() {
		require(msg.sender == authority, "Unauthorized user");
		_;
	}

	function createTeam() public returns (uint256) {
		Team storage team = teams[counter];
		team.members[0] = msg.sender;
		for(uint256 i = 0; i < 5; i++) {
			drafts[msg.sender][i] = "";
		}
		emit TeamCreated(counter, msg.sender);
		counter++;
		return counter - 1;
	}

	function join(uint256 id) public {
		Team storage team = teams[id];
		bool joined = false;
		for(uint256 i = 0; i < 5; i++) {
			if(team.members[i] == address(0)) {
				team.members[i] = msg.sender;
				for(uint256 j = 0; j < 5; j++) {
					drafts[msg.sender][j] = "";
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

	function addFunds(uint256 id) public {
		Team storage team = teams[id];
		uint256 index = 5;
		for(uint256 i = 0; i < 5; i++) {
			if(team.members[i] == msg.sender && team.funds[i] == 0) {
				index = i;
				break;
			}
		}
		require(index < 5, "Could not find player with no balance");
		require(IERC20(token).transferFrom(msg.sender, address(this), 100 * (10 ** 18)), "Transfer failed");
		team.funds[index] = 100;
		balances[msg.sender] = 100;
	}

	function claimPrize(uint256 id) public {
		Team storage team = teams[id];
		uint256 index = 5;
		for(uint256 i = 0; i < 5; i++) {
			if(team.members[i] == msg.sender && team.prizes[i] > 0) {
				index = i;
				break;
			}
		}
		require(index < 5, "Could not find player with prizes");
		uint256 prize = team.prizes[index];
		team.prizes[index] = 0;
		require(IERC20(token).transfer(msg.sender, prize * (10 ** 18)), "Transfer failed");
		emit PrizeClaimed(id, msg.sender, prize);
	}

	function setAuthority(address updatedAuthority) public onlyAuthority {
		authority = updatedAuthority;
	}

	function setPrice(string memory kol, uint256 price) public onlyAuthority {
		prices[kol] = price;
		emit PriceUpdated(kol, price);
	}

	function setPrize(uint256 id, address player, uint256 amount) public onlyAuthority {
		Team storage team = teams[id];
		uint256 index = 5;
		for(uint256 i = 0; i < 5; i++) {
			if(team.members[i] == player) {
				index = i;
				break;
			}
		}
		require(index < 5, "Could not find player");
		team.prizes[index] = amount;
		emit PrizeIssued(id, player, amount);
	}

	function setToken(address updatedAddress) public onlyAuthority {
		token = updatedAddress;
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

	function getPrize(uint256 id, address player) public view returns (uint256) {
		Team storage team = teams[id];
		uint256 index = 5;
		for(uint256 i = 0; i < 5; i++) {
			if(team.members[i] == player && team.prizes[i] > 0) {
				index = i;
				break;
			}
		}
		uint256 prize = 0;
		if(index < 5) {
			prize = team.prizes[index];
		}
		return prize;
	}

	function getBalance(address player) public view returns (uint256) {
		return balances[address];
	}

	function getToken() public view returns (address) {
		return token;
	}
}