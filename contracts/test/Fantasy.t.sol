// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Fantasy} from "../src/Fantasy.sol";

contract FantasyTest is Test {
    Fantasy fantasy;
    address owner = address(0x8B603f2890694cF31689dFDA28Ff5e79917243e9);
    address alice = address(2);
    address bob = address(3);

    function setUp() public {
        // Use an owner address that is not one of the precompile addresses.
        owner = vm.addr(100); // This generates a pseudo-random address (not 0x1)
        vm.deal(owner, 100 ether);
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);

        // Deploy Fantasy with the new owner.
        vm.prank(owner);
        fantasy = new Fantasy(owner);
    }

    // Test creating a team.
    function testCreateTeam() public {
        uint256 deposit = 1 ether;
        // Record owner's ETH balance before.
        uint256 ownerBalanceBefore = owner.balance;

        // Simulate alice calling createTeam with the correct deposit.
        vm.prank(alice);
        uint256 teamId = fantasy.createTeam{value: deposit}(deposit);

        // Check that alice's membership mapping is set to the new team id.
        uint256 aliceTeam = fantasy.getTeam(alice);
        assertEq(aliceTeam, teamId, "Alice should be in the new team");

        // Check that alice's fantasy balance is set to 100.
        uint256 aliceFantasyBalance = fantasy.getBalance(alice);
        assertEq(
            aliceFantasyBalance,
            100,
            "Alice should have a fantasy balance of 100"
        );

        // Check team deposit and pool calculations.
        uint256 teamDeposit = fantasy.getDeposit(teamId);
        assertEq(teamDeposit, deposit, "Team deposit mismatch");

        // Fee is deposit/5, so pool should be deposit - fee.
        uint256 expectedPool = deposit - (deposit / 5);
        uint256 teamPool = fantasy.getPrizePool(teamId);
        assertEq(
            teamPool,
            expectedPool,
            "Team pool should equal deposit minus fee"
        );

        // Verify that the fee was transferred to the owner.
        uint256 ownerBalanceAfter = owner.balance;
        assertEq(
            ownerBalanceAfter,
            ownerBalanceBefore + (deposit / 5),
            "Owner did not receive the fee"
        );
    }

    // Test joining an existing team.
    function testJoinTeam() public {
        uint256 deposit = 1 ether;
        // alice creates a team.
        vm.prank(alice);
        uint256 teamId = fantasy.createTeam{value: deposit}(deposit);

        // bob joins the team.
        vm.prank(bob);
        fantasy.join{value: deposit}(teamId);

        // Verify bob's membership mapping.
        uint256 bobTeam = fantasy.getTeam(bob);
        assertEq(bobTeam, teamId, "Bob should be in the team");

        // Verify bob's fantasy balance.
        uint256 bobFantasyBalance = fantasy.getBalance(bob);
        assertEq(
            bobFantasyBalance,
            100,
            "Bob should have a fantasy balance of 100"
        );
    }

    // Test leaving a team.
    function testLeaveTeam() public {
        uint256 deposit = 1 ether;
        // alice creates a team.
        vm.prank(alice);
        uint256 teamId = fantasy.createTeam{value: deposit}(deposit);
        // bob joins the team.
        vm.prank(bob);
        fantasy.join{value: deposit}(teamId);

        // bob leaves the team.
        vm.prank(bob);
        fantasy.leave(teamId);

        // Check that bob's membership mapping is reset.
        uint256 bobTeam = fantasy.getTeam(bob);
        assertEq(bobTeam, 0, "Bob should no longer be in a team");
    }

    // Test drafting a single KOL.
    function testDraft() public {
        uint256 deposit = 1 ether;
        // alice creates a team to initialize her fantasy balance.
        vm.prank(alice);
        fantasy.createTeam{value: deposit}(deposit);

        // Record alice's fantasy balance before drafting.
        uint256 balanceBefore = fantasy.getBalance(alice);
        // Draft "KOL1" at index 0 (default price is 10).
        vm.prank(alice);
        fantasy.draft(alice, "KOL1", 0);
        uint256 balanceAfter = fantasy.getBalance(alice);

        // Ensure the drafting cost is deducted.
        assertEq(
            balanceAfter,
            balanceBefore - 10,
            "Draft cost should be deducted from fantasy balance"
        );

        // Verify that the draft mapping is updated.
        string[5] memory drafts = fantasy.getDraft(alice);
        assertEq(
            keccak256(bytes(drafts[0])),
            keccak256(bytes("KOL1")),
            "Draft should record 'KOL1'"
        );
    }

    // Test claiming a prize.
    function testClaimPrize() public {
        uint256 deposit = 1 ether;
        // alice creates a team.
        vm.prank(alice);
        uint256 teamId = fantasy.createTeam{value: deposit}(deposit);

        // As the owner, add a prize (e.g. 0.5 ether) for alice.
        uint256 prizeAmount = 0.5 ether;
        vm.prank(owner);
        fantasy.addPrize(teamId, alice, prizeAmount);

        // Check that the team pool decreased accordingly.
        uint256 expectedPool = deposit - (deposit / 5) - prizeAmount;
        uint256 teamPool = fantasy.getPrizePool(teamId);
        assertEq(
            teamPool,
            expectedPool,
            "Team pool should decrease by the prize amount"
        );

        // Record alice's ETH balance before claiming the prize.
        uint256 aliceEthBefore = alice.balance;
        // alice claims her prize.
        vm.prank(alice);
        fantasy.claimPrize(teamId);
        uint256 aliceEthAfter = alice.balance;

        // Due to gas costs, allow a small tolerance.
        assertApproxEqAbs(aliceEthAfter, aliceEthBefore + prizeAmount, 1e15);
    }
}
