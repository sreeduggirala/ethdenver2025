// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Fantasy is Ownable, ERC20 {
    event TeamCreated(uint256 id, address creator);
    event PlayerJoined(address player, uint256 id);
    event PlayerLeft(address player, uint256 id);
    event Drafted(address player, string kol, uint256 index);
    event PriceUpdated(string kol, uint256 price);
    event PrizeIssued(uint256 id, address player, uint256 amount);
    event PointsIssued(uint256 id, address player, uint256 amount);
    event PrizeClaimed(uint256 id, address player, uint256 amount);

    address public feeCollector;
    address public token = 0xCfd748B9De538c9f5b1805e8db9e1d4671f7F2ec;
    uint256 counter = 1;
    // address public token = 0x866386C7f4F2A5f46C5F4566D011dbe3e8679BE4;

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

    constructor(
        address _initialOwner
    ) Ownable(_initialOwner) ERC20("Fantasy", "FNT") {
        feeCollector = _initialOwner;
    }

    function createTeam(uint256 deposit) public returns (uint256) {
        require(membership[msg.sender] == 0, "Already in a team");
        Team storage team = teams[counter];
        team.exists = true;
        team.deposit = deposit;
        team.members[0] = msg.sender;
        for (uint256 i = 0; i < 5; i++) {
            drafts[msg.sender][i] = "";
        }
        membership[msg.sender] = counter;
        emit TeamCreated(counter, msg.sender);
        counter++;
        return counter - 1;
    }

    function join(uint256 id) public {
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
                require(
                    IERC20(token).transferFrom(
                        msg.sender,
                        address(this),
                        team.deposit * (10 ** 18)
                    ),
                    "Funds transfer failed"
                );
                uint256 fee = team.deposit / 5;
                require(
                    IERC20(token).transfer(feeCollector, fee * (10 ** 18)),
                    "Fee transfer failed"
                );
                team.pool += team.deposit - fee;
                balances[msg.sender] = 100;
                emit PlayerJoined(msg.sender, id);
                break;
            }
        }
        require(joined, "Team is already full");
    }

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

    function draft(address player, string memory kol, uint256 index) public {
        require(index < 5, "Index must be less than 5");
        uint256 price = 10;
        if (prices[kol] > 0) {
            price = prices[kol];
        }
        require(balances[player] >= price, "Insufficient funds");
        balances[player] -= price;
        drafts[player][index] = kol;
        emit Drafted(player, kol, index);
    }

    function draftAll(address player, string[] memory kols) public {
        require(kols.length == 5, "Number of KOLs must be 5");
        uint256 price = 10;
        for (uint256 i = 0; i < 5; i++) {
            price = 10;
            if (prices[kols[i]] > 0) {
                price = prices[kols[i]];
            }
            require(balances[player] >= price, "Insufficient funds");
            balances[player] -= price;
            drafts[player][i] = kols[i];
            emit Drafted(player, kols[i], i);
        }
    }

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
        require(
            IERC20(token).transfer(msg.sender, prize * (10 ** 18)),
            "Prize transfer failed"
        );
        emit PrizeClaimed(id, msg.sender, prize);
    }

    function setFeeCollector(address updatedFeeCollector) public onlyOwner {
        feeCollector = updatedFeeCollector;
    }

    function setPrice(string memory kol, uint256 price) public onlyOwner {
        prices[kol] = price;
        emit PriceUpdated(kol, price);
    }

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
        require(amount >= team.pool, "Insufficient funds");
        team.pool -= amount;
        team.prizes[index] += amount;
        emit PrizeIssued(id, player, amount);
    }

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
            require(prizes[i] >= team.pool, "Insufficient funds");
            team.pool -= prizes[i];
            team.prizes[i] += prizes[i];
            emit PrizeIssued(id, team.members[i], prizes[i]);
            team.points[i] += points[i];
            emit PointsIssued(id, team.members[i], points[i]);
        }
    }

    function setToken(address updatedAddress) public onlyOwner {
        token = updatedAddress;
    }

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

    function getPrizePool(uint256 id) public view returns (uint256 memory) {
        return teams[id].pool;
    }

    function getDeposit(uint256 id) public view returns (uint256 memory) {
        return teams[id].deposit;
    }

    function checkLocked(uint256 id) public view returns (bool memory) {
        return teams[id].locked;
    }

    function checkExists(uint256 id) public view returns (bool memory) {
        return teams[id].exists;
    }

    function getDraft(address player) public view returns (string[5] memory) {
        return drafts[player];
    }

    function getPrice(string memory kol) public view returns (uint256) {
        uint256 price = 10;
        if (prices[kol] > 0) {
            price = prices[kol];
        }
        return price;
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

    function getToken() public view returns (address) {
        return token;
    }
}
