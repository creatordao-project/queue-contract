// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, upgrades } from "hardhat";
import {expect} from "chai";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const [deployer] = await ethers.getSigners();
  console.log(deployer.address);
  const CreatorDAOCommission = await ethers.getContractFactory("CreatorDAOCommission");
  // const greeter = await upgrades.deployBeacon(Greeter);
  //   await greeter.deployed();
  //   console.log("CreatorDAOCommission deployed to:", greeter.address);
  const gmFans = CreatorDAOCommission.attach("0xD72f14FF489C8369CfEDB764cf5D8f622b110827");
  //   console.log("gmfans", instance.address);


  // expect(await gmFans.newShopIndex()).to.be.equal(1);

  // await expect(await gmFans.addShop(1, 50, deployer.address)).to.emit(gmFans, 'NewShop').withArgs('1','1', '50', deployer.address);

  

  // expect(await gmFans.newShopIndex()).to.be.equal(2);
  // await expect(await gmFans.addShop(10, 100, deployer.address)).to.emit(gmFans, 'NewShop').withArgs('2','10', '100', deployer.address);

  // await expect(gmFans.connect(usr).commission('hi', 1, { value:  ethers.utils.parseEther('1')})).to.emit(gmFans, 'NewCommission').withArgs('1', 'hi', '1', ethers.utils.parseEther('1'), usr.address);
  // await expect(gmFans.connect(deployer).commission('test2', 2, { value:  ethers.utils.parseEther('0.0000001')})).to.emit(gmFans, 'NewCommission').withArgs('2', 'test2', '2', ethers.utils.parseEther('0.0000001'), deployer.address);
  // console.log("new commission 2", await ethers.provider.getBalance(deployer.address));


  // await expect(gmFans.connect(artist).processCommissions([1])).to.be.reverted;
    
  // await expect(await gmFans.connect(deployer).processCommissions([1])).to.changeEtherBalance(deployer, ethers.utils.parseEther('0.000000095'));

  // await expect(gmFans.connect(deployer).processCommissions([1])).to.to.be.revertedWith("commission not in the queue");


  // await expect(await gmFans.connect(deployer).processCommissions([2])).to.changeEtherBalance(dao, ethers.utils.parseEther('0.1'));

  // await expect(gmFans.connect(artist).rescindCommission([3])).to.be.revertedWith("commission not yours");

  
  // await gmFans.connect(deployer).increaseCommissionBid(2, { value:  ethers.utils.parseEther('0.000002')});
  // await expect(await gmFans.connect(deployer).increaseCommissionBid([1], { value:  ethers.utils.parseEther('0.0000002')})).to.emit(gmFans, 'CommissionBidUpdated').withArgs('1', ethers.utils.parseEther('0.0000002'), ethers.utils.parseEther('0.0000003'));

  // await expect(await gmFans.connect(usr).rescindCommission([3])).to.emit(gmFans, 'CommissionRescinded').withArgs('3', ethers.utils.parseEther('3'));

  await expect(await gmFans.connect(deployer).rescindCommission([2])).to.changeEtherBalance(deployer, ethers.utils.parseEther('0.0000003'));

  //  expect((await gmFans.commissions(3)).status).to.eq(2);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
