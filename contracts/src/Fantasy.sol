// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Fantasy is Ownable {
    uint256 counter = 1;

    struct Team {
        address[5] members;
        uint256[5] prizes;
        uint256[5] points;
        uint256 pool;
        uint256 deposit;
        bool locked;
        bool exists;
    }

    mapping(address => string[5]) public drafts;
    mapping(uint256 => Team) public teams;
    mapping(string => uint256) public prices;
    mapping(address => uint256) public balances;
    mapping(address => uint256) public membership;

    event TeamCreated(uint256 id, address creator);
    event PlayerJoined(address player, uint256 id);
    event PlayerLeft(address player, uint256 id);
    event Drafted(address player, string kol, uint256 index);
    event PriceUpdated(string kol, uint256 price);
    event PrizeIssued(uint256 id, address player, uint256 amount);
    event PointsIssued(uint256 id, address player, uint256 amount);
    event PrizeClaimed(uint256 id, address player, uint256 amount);

    // Constructor sets the deployer as the owner.
    constructor(address owner) Ownable(owner) {}

    // Create a team by sending an ETH deposit.
    function createTeam(uint256 deposit) public payable returns (uint256) {
        require(membership[msg.sender] == 0, "Already in a team");
        require(msg.value == deposit, "Incorrect deposit amount");

        Team storage team = teams[counter];
        team.exists = true;
        team.deposit = deposit;
        team.members[0] = msg.sender;
        for (uint256 i = 0; i < 5; i++) {
            drafts[msg.sender][i] = "";
        }
        membership[msg.sender] = counter;

        // Calculate fee (a fifth of the deposit) and forward it to the owner.
        uint256 fee = deposit / 5;
        payable(owner()).transfer(fee);

        // The remaining deposit becomes the team's pool.
        team.pool = deposit - fee;
        balances[msg.sender] = 100;

        emit TeamCreated(counter, msg.sender);
        counter++;
        return counter - 1;
    }

    // Join an existing team by sending the required deposit in ETH.
    function join(uint256 id) public payable {
        require(membership[msg.sender] == 0, "Already in a team");
        Team storage team = teams[id];
        require(team.exists, "Team does not exist");
        require(!team.locked, "Team is locked");

        bool joined = false;
        for (uint256 i = 0; i < 5; i++) {
            if (team.members[i] == address(0)) {
                team.members[i] = msg.sender;
                for (uint256 j = 0; j < 5; j++) {
                    drafts[msg.sender][j] = "";
                }
                joined = true;
                membership[msg.sender] = id;
                require(msg.value == team.deposit, "Incorrect deposit amount");

                uint256 fee = team.deposit / 5;
                payable(owner()).transfer(fee);
                team.pool += team.deposit - fee;
                balances[msg.sender] = 100;
                emit PlayerJoined(msg.sender, id);
                break;
            }
        }
        require(joined, "Team is already full");
    }

    // Allow a player to leave a team.
    function leave(uint256 id) public {
        Team storage team = teams[id];
        require(team.exists, "Team does not exist");
        uint256 index = 5;
        for (uint256 i = 0; i < 5; i++) {
            if (team.members[i] == msg.sender) {
                index = i;
                break;
            }
        }
        require(index < 5, "Could not find player in that team");

        team.members[index] = address(0);
        team.prizes[index] = 0;
        team.points[index] = 0;
        membership[msg.sender] = 0;
        emit PlayerLeft(msg.sender, id);
    }

    // Draft a single KOL for a player.
    function draft(address player, string memory kol, uint256 index) public {
        require(index < 5, "Index must be less than 5");
        uint256 price = prices[kol] > 0 ? prices[kol] : 10;
        require(balances[player] >= price, "Insufficient funds");
        balances[player] -= price;
        drafts[player][index] = kol;
        emit Drafted(player, kol, index);
    }

    // Draft all 5 KOLs for a player.
    function draftAll(address player, string[] memory kols) public {
        require(kols.length == 5, "Number of KOLs must be 5");
        for (uint256 i = 0; i < 5; i++) {
            uint256 price = prices[kols[i]] > 0 ? prices[kols[i]] : 10;
            require(balances[player] >= price, "Insufficient funds");
            balances[player] -= price;
            drafts[player][i] = kols[i];
            emit Drafted(player, kols[i], i);
        }
    }

    // Claim a prize by receiving ETH from the contract.
    function claimPrize(uint256 id) public {
        Team storage team = teams[id];
        require(team.exists, "Team does not exist");
        uint256 index = 5;
        for (uint256 i = 0; i < 5; i++) {
            if (team.members[i] == msg.sender && team.prizes[i] > 0) {
                index = i;
                break;
            }
        }
        require(index < 5, "Could not find player with prizes");

        uint256 prize = team.prizes[index];
        team.prizes[index] = 0;
        payable(msg.sender).transfer(prize);
        emit PrizeClaimed(id, msg.sender, prize);
    }

    // Set the price for a KOL.
    function setPrice(string memory kol, uint256 price) public onlyOwner {
        prices[kol] = price;
        emit PriceUpdated(kol, price);
    }

    // Add a prize (ETH amount) to a player's account within a team.
    function addPrize(
        uint256 id,
        address player,
        uint256 amount
    ) public onlyOwner {
        Team storage team = teams[id];
        require(team.exists, "Team does not exist");
        uint256 index = 5;
        for (uint256 i = 0; i < 5; i++) {
            if (team.members[i] == player) {
                index = i;
                break;
            }
        }
        require(index < 5, "Could not find player");
        team.locked = true;
        require(team.pool >= amount, "Insufficient funds");
        team.pool -= amount;
        team.prizes[index] += amount;
        emit PrizeIssued(id, player, amount);
    }

    // Add points to a player within a team.
    function addPoints(
        uint256 id,
        address player,
        uint256 amount
    ) public onlyOwner {
        Team storage team = teams[id];
        require(team.exists, "Team does not exist");
        uint256 index = 5;
        for (uint256 i = 0; i < 5; i++) {
            if (team.members[i] == player) {
                index = i;
                break;
            }
        }
        require(index < 5, "Could not find player");
        team.locked = true;
        team.points[index] += amount;
        emit PointsIssued(id, player, amount);
    }

    // Batch add prizes and points to each team member.
    function addAllPrizesAndPoints(
        uint256 id,
        uint256[] memory prizes,
        uint256[] memory points
    ) public onlyOwner {
        require(prizes.length == 5, "Number of prizes must be 5");
        require(points.length == 5, "Number of points must be 5");
        Team storage team = teams[id];
        require(team.exists, "Team does not exist");
        team.locked = true;
        for (uint256 i = 0; i < 5; i++) {
            require(team.pool >= prizes[i], "Insufficient funds");
            team.pool -= prizes[i];
            team.prizes[i] += prizes[i];
            emit PrizeIssued(id, team.members[i], prizes[i]);
            team.points[i] += points[i];
            emit PointsIssued(id, team.members[i], points[i]);
        }
    }

    // Getter functions.
    function getMembersFromTeam(
        uint256 id
    ) public view returns (address[5] memory) {
        return teams[id].members;
    }

    function getPointsFromTeam(
        uint256 id
    ) public view returns (uint256[5] memory) {
        return teams[id].points;
    }

    function getPrizePool(uint256 id) public view returns (uint256) {
        return teams[id].pool;
    }

    function getDeposit(uint256 id) public view returns (uint256) {
        return teams[id].deposit;
    }

    function checkLocked(uint256 id) public view returns (bool) {
        return teams[id].locked;
    }

    function checkExists(uint256 id) public view returns (bool) {
        return teams[id].exists;
    }

    function getDraft(address player) public view returns (string[5] memory) {
        return drafts[player];
    }

    function getPrice(string memory kol) public view returns (uint256) {
        return prices[kol] > 0 ? prices[kol] : 10;
    }

    function getPrize(
        uint256 id,
        address player
    ) public view returns (uint256) {
        Team storage team = teams[id];
        require(team.exists, "Team does not exist");
        uint256 index = 5;
        for (uint256 i = 0; i < 5; i++) {
            if (team.members[i] == player && team.prizes[i] > 0) {
                index = i;
                break;
            }
        }
        uint256 prize = 0;
        if (index < 5) {
            prize = team.prizes[index];
        }
        return prize;
    }

    function getBalance(address player) public view returns (uint256) {
        return balances[player];
    }

    function getTeam(address player) public view returns (uint256) {
        return membership[player];
    }
}
