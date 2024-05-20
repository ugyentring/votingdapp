const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  let Voting;
  let voting;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    Voting = await ethers.getContractFactory("Voting");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    voting = await Voting.deploy(["karma", "ut"], 10);
    await voting.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await voting.getOwner()).to.equal(owner.address);
    });

    it("Should initialize with the correct candidates", async function () {
      const candidates = await voting.getAllVotesOfCandiates();
      expect(candidates.length).to.equal(2);
      expect(candidates[0].name).to.equal("Alice");
      expect(candidates[1].name).to.equal("Bob");
    });

    it("Should set the voting duration correctly", async function () {
      const votingStart = await voting.votingStart();
      const votingEnd = await voting.votingEnd();
      const duration = votingEnd.sub(votingStart);
      expect(duration).to.equal(10 * 60); // 10 minutes in seconds
    });
  });

  describe("Voting", function () {
    it("Should allow a user to vote and record the vote", async function () {
      await voting.connect(addr1).vote(0);
      const candidates = await voting.getAllVotesOfCandiates();
      expect(candidates[0].voteCount).to.equal(1);
      expect(await voting.voters(addr1.address)).to.equal(true);
    });

    it("Should not allow double voting", async function () {
      await voting.connect(addr1).vote(0);
      await expect(voting.connect(addr1).vote(0)).to.be.revertedWith(
        "You have already voted."
      );
    });

    it("Should not allow voting for an invalid candidate", async function () {
      await expect(voting.connect(addr1).vote(2)).to.be.revertedWith(
        "Invalid candidate index."
      );
    });
  });

  describe("Owner actions", function () {
    it("Should allow the owner to add a new candidate", async function () {
      await voting.addCandidate("Charlie");
      const candidates = await voting.getAllVotesOfCandiates();
      expect(candidates.length).to.equal(3);
      expect(candidates[2].name).to.equal("Charlie");
    });

    it("Should restrict adding candidates to only the owner", async function () {
      await expect(voting.connect(addr1).addCandidate("Charlie")).to.be
        .reverted;
    });
  });

  describe("Voting status", function () {
    it("Should return true if voting is ongoing", async function () {
      expect(await voting.getVotingStatus()).to.equal(true);
    });

    it("Should return the correct remaining time", async function () {
      const remainingTime = await voting.getRemainingTime();
      const currentTime = ethers.BigNumber.from(
        (await ethers.provider.getBlock("latest")).timestamp
      );
      const votingEnd = await voting.votingEnd();
      const expectedRemainingTime = votingEnd.sub(currentTime);
      expect(remainingTime).to.be.closeTo(expectedRemainingTime, 2);
    });
  });
});
