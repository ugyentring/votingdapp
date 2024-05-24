const { expect } = require("chai"); // Importing Chai for assertions
const { ethers } = require("hardhat"); // Importing Hardhat's ethers for interacting with Ethereum contracts

describe("Voting Contract", function () {
  //organize the tests into different sections
  let Voting; // Variable to hold the contract factory
  let voting; // Variable to hold the deployed contract instance
  let owner; // Variable to hold the contract owner's signer
  let addr1; // Variable to hold the first address signer
  let addr2; // Variable to hold the second address signer
  let addrs; // Variable to hold additional signers

  beforeEach(async function () {
    // Before each test case, perform the following setup
    Voting = await ethers.getContractFactory("Voting"); // Get the contract factory for the "Voting" contract
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners(); // Get the signers from the Ethereum network, owner is the first signer, others are assigned to addr1, addr2, and addrs
    voting = await Voting.deploy(["Pema", "Sonam"], 10); // Deploy the "Voting" contract with initial candidates Alice and Bob, and a voting duration of 10 minutes
    await voting.deployed(); // Wait for the contract deployment to be completed
  });

  describe("Deployment", function () {
    // Testing the deployment of the contract
    it("Should set the right owner", async function () {
      // Test case to check if the owner is set correctly
      expect(await voting.getOwner()).to.equal(owner.address); // Assert that the contract owner is set correctly
    });

    it("Should initialize with the correct candidates", async function () {
      // Test case to check if the initial candidates are set correctly
      const candidates = await voting.getAllVotesOfCandiates(); // Get the list of all candidates from the contract
      expect(candidates.length).to.equal(2); // Assert that there are 2 initial candidates
      expect(candidates[0].name).to.equal("Pema"); // Assert that the first candidate is Alice
      expect(candidates[1].name).to.equal("Sonam"); // Assert that the second candidate is Bob
    });

    it("Should set the voting duration correctly", async function () {
      // Test case to check if the voting duration is set correctly
      const votingStart = await voting.votingStart(); // Get the start time of the voting
      const votingEnd = await voting.votingEnd(); // Get the end time of the voting
      const duration = votingEnd.sub(votingStart); // Calculate the duration of the voting
      expect(duration).to.equal(10 * 60); // Assert that the duration is 10 minutes in seconds
    });
  });

  describe("Voting", function () {
    // Testing the voting functionality
    it("Should allow a user to vote and record the vote", async function () {
      // Test case to check if a user can vote and record the vote
      await voting.connect(addr1).vote(0); // User at addr1 votes for the first candidate (index 0)
      const candidates = await voting.getAllVotesOfCandiates(); // Get the updated list of candidates
      expect(candidates[0].voteCount).to.equal(1); // Assert that the vote count for the first candidate is 1
      expect(await voting.voters(addr1.address)).to.equal(true); // Assert that the user at addr1 is recorded as a voter
    });

    it("Should not allow double voting", async function () {
      // Test case to check if double voting is prevented
      await voting.connect(addr1).vote(0); // User at addr1 votes for the first candidate (index 0)
      await expect(voting.connect(addr1).vote(0)).to.be.revertedWith(
        // Expect a revert if the user at addr1 tries to vote again for the same candidate
        "You have already voted."
      );
    });

    it("Should not allow voting for an invalid candidate", async function () {
      // Test case to check if voting for an invalid candidate is prevented
      await expect(voting.connect(addr1).vote(2)).to.be.revertedWith(
        // Expect a revert if the user at addr1 tries to vote for an invalid candidate index
        "Invalid candidate index."
      );
    });
  });

  describe("Owner actions", function () {
    // Testing actions that only the owner can perform
    it("Should allow the owner to add a new candidate", async function () {
      // Test case to check if the owner can add a new candidate
      await voting.addCandidate("Charlie"); // Owner adds a new candidate named Charlie
      const candidates = await voting.getAllVotesOfCandiates(); // Get the updated list of candidates
      expect(candidates.length).to.equal(3); // Assert that there are now 3 candidates
      expect(candidates[2].name).to.equal("Charlie"); // Assert that the third candidate is Charlie
    });

    it("Should restrict adding candidates to only the owner", async function () {
      // Test case to check if adding candidates is restricted to only the owner
      await expect(voting.connect(addr1).addCandidate("Charlie")).to.be // Expect a revert if a non-owner tries to add a candidate
        .reverted;
    });
  });

  describe("Voting status", function () {
    // Testing functions related to voting status
    it("Should return true if voting is ongoing", async function () {
      // Test case to check if voting is ongoing
      expect(await voting.getVotingStatus()).to.equal(true); // Assert that the voting status is true
    });

    it("Should return the correct remaining time", async function () {
      // Test case to check if the correct remaining time is returned
      const remainingTime = await voting.getRemainingTime(); // Get the remaining time for the current round of voting
      const currentTime = ethers.BigNumber.from(
        (await ethers.provider.getBlock("latest")).timestamp
      ); // Get the current timestamp
      const votingEnd = await voting.votingEnd(); // Get the end time of the current round of voting
      const expectedRemainingTime = votingEnd.sub(currentTime); // Calculate the expected remaining time
      expect(remainingTime).to.be.closeTo(expectedRemainingTime, 2); // Assert that the remaining time is close to the expected remaining time with a 2-second margin
    });
  });
});
