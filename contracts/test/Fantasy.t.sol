// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Fantasy} from "../src/Fantasy.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// A dummy ERC20 token that allows minting for testing purposes.
contract DummyERC20 is ERC20 {
    constructor() ERC20("Dummy", "DUM") {
        // Mint an initial amount to the deployer.
        _mint(msg.sender, 10000 * 10 ** 18);
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract FantasyTest is Test {
    Fantasy fantasy;
    DummyERC20 dummy;

    // Define test addresses for different users.
    address user1 = address(0x1);
    address user2 = address(0x2);
    address user3 = address(0x3);

    function setUp() public {
        // Deploy the dummy token and mint tokens for test users.
        dummy = new DummyERC20();
        dummy.mint(user1, 1000 * 10 ** 18);
        dummy.mint(user2, 1000 * 10 ** 18);
        dummy.mint(user3, 1000 * 10 ** 18);

        // Deploy the Fantasy contract.
        // We pass address(this) as the owner and the dummy token address as initialToken.
        fantasy = new Fantasy(address(this), address(dummy));

        // Have each test user approve the Fantasy contract to spend their tokens.
        vm.startPrank(user1);
        dummy.approve(address(fantasy), type(uint256).max);
        vm.stopPrank();

        vm.startPrank(user2);
        dummy.approve(address(fantasy), type(uint256).max);
        vm.stopPrank();

        vm.startPrank(user3);
        dummy.approve(address(fantasy), type(uint256).max);
        vm.stopPrank();
    }

    function testCreateTeam() public {
        // user1 creates a team with a deposit of 100.
        vm.prank(user1);
        uint256 teamId = fantasy.createTeam(100);

        // Verify that user1’s membership is updated.
        assertEq(fantasy.getTeam(user1), teamId);

        // Verify that the team’s deposit was set correctly.
        uint256 deposit = fantasy.getDeposit(teamId);
        assertEq(deposit, 100);
    }

    function testJoinTeam() public {
        // user1 creates a team and user2 joins it.
        vm.prank(user1);
        uint256 teamId = fantasy.createTeam(100);

        // Ensure user2 is not in any team initially.
        assertEq(fantasy.getTeam(user2), 0);

        // user2 joins the team.
        vm.prank(user2);
        fantasy.join(teamId);

        // Verify that user2’s membership is updated.
        assertEq(fantasy.getTeam(user2), teamId);

        // Verify that user2 appears in the team’s members array.
        address[5] memory members = fantasy.getMembersFromTeam(teamId);
        bool found = false;
        for (uint256 i = 0; i < 5; i++) {
            if (members[i] == user2) {
                found = true;
                break;
            }
        }
        assertTrue(found);

        // Check that user2’s internal balance was set to 100 by the join function.
        uint256 bal = fantasy.getBalance(user2);
        assertEq(bal, 100);

        // Check token transfers:
        // user2 transfers 100 tokens (scaled by 10**18) for the deposit.
        // A fee equal to deposit/5 (i.e. 20 tokens) is transferred to the owner.
        // Thus, user2’s token balance should now be 1000 - 100 = 900 tokens.
        assertEq(dummy.balanceOf(user2), 900 * 10 ** 18);
        // The Fantasy contract receives the remaining 80 tokens (100 - 20).
        assertEq(dummy.balanceOf(address(fantasy)), 160 * 10 ** 18);
    }

    function testLeaveTeam() public {
        // user1 creates a team, user2 joins then leaves.
        vm.prank(user1);
        uint256 teamId = fantasy.createTeam(100);

        vm.prank(user2);
        fantasy.join(teamId);
        assertEq(fantasy.getTeam(user2), teamId);

        vm.prank(user2);
        fantasy.leave(teamId);
        // After leaving, user2’s membership should be reset.
        assertEq(fantasy.getTeam(user2), 0);

        // Verify that user2 is no longer in the team’s members array.
        address[5] memory members = fantasy.getMembersFromTeam(teamId);
        bool found = false;
        for (uint256 i = 0; i < 5; i++) {
            if (members[i] == user2) {
                found = true;
                break;
            }
        }
        assertTrue(!found);
    }

    function testDraft() public {
        // user1 creates a team and user2 joins.
        vm.prank(user1);
        uint256 teamId = fantasy.createTeam(100);
        vm.prank(user2);
        fantasy.join(teamId);

        // Verify that user2’s draft slots are initially empty.
        string[5] memory draftsBefore = fantasy.getDraft(user2);
        for (uint256 i = 0; i < 5; i++) {
            assertEq(draftsBefore[i], "");
        }

        // user2 drafts "KOL1" into index 0.
        vm.prank(user2);
        fantasy.draft(user2, "KOL1", 0);

        // Verify the draft was recorded.
        string[5] memory draftsAfter = fantasy.getDraft(user2);
        assertEq(draftsAfter[0], "KOL1");

        // The default draft price is 10; therefore, user2’s internal balance should decrease from 100 to 90.
        uint256 balanceAfter = fantasy.getBalance(user2);
        assertEq(balanceAfter, 90);
    }

    function testDraftAll() public {
        // user1 creates a team and user2 joins.
        vm.prank(user1);
        uint256 teamId = fantasy.createTeam(100);
        vm.prank(user2);
        fantasy.join(teamId);

        // Prepare an array of 5 KOL names.
        string[] memory kols = new string[](5);
        kols[0] = "KOL1";
        kols[1] = "KOL2";
        kols[2] = "KOL3";
        kols[3] = "KOL4";
        kols[4] = "KOL5";

        // user2 drafts all 5 KOLs.
        vm.prank(user2);
        fantasy.draftAll(user2, kols);

        // Verify that all drafts were recorded correctly.
        string[5] memory draftsAfter = fantasy.getDraft(user2);
        for (uint256 i = 0; i < 5; i++) {
            assertEq(draftsAfter[i], kols[i]);
        }
        // Since each draft costs 10, the total deduction is 50; user2’s internal balance should now be 50.
        uint256 balanceAfter = fantasy.getBalance(user2);
        assertEq(balanceAfter, 50);
    }

    function testClaimPrize() public {
        // user1 creates a team and user2 joins.
        vm.prank(user1);
        uint256 teamId = fantasy.createTeam(100);
        vm.prank(user2);
        fantasy.join(teamId);

        // For testing purposes, add a prize for user2 via the owner.
        // At join with deposit=100, the pool becomes 80 tokens.
        vm.prank(address(this));
        fantasy.addPrize(teamId, user2, 80);

        // Capture user2’s token balance before claiming the prize.
        uint256 balanceBefore = dummy.balanceOf(user2);

        // user2 claims their prize.
        vm.prank(user2);
        fantasy.claimPrize(teamId);

        // user2 should receive 80 tokens (scaled by 10**18).
        uint256 balanceAfter = dummy.balanceOf(user2);
        assertEq(balanceAfter, balanceBefore + (80 * 10 ** 18));

        // Verify that user2’s prize has been reset to 0.
        uint256 prize = fantasy.getPrize(teamId, user2);
        assertEq(prize, 0);
    }

    function testSetPrice() public {
        // Only the owner can set the price.
        vm.prank(address(this));
        fantasy.setPrice("KOL1", 50);

        uint256 price = fantasy.getPrice("KOL1");
        assertEq(price, 50);
    }

    function testAddPoints() public {
        // user1 creates a team and user2 joins.
        vm.prank(user1);
        uint256 teamId = fantasy.createTeam(100);
        vm.prank(user2);
        fantasy.join(teamId);

        // Add points for user2 via the owner.
        vm.prank(address(this));
        fantasy.addPoints(teamId, user2, 25);

        // Retrieve the points for the team and verify that user2 received 25 points.
        uint256[5] memory points = fantasy.getPointsFromTeam(teamId);
        bool found = false;
        for (uint256 i = 0; i < 5; i++) {
            if (points[i] == 25) {
                found = true;
                break;
            }
        }
        assertTrue(found);
    }
}
