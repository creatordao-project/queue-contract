// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, upgrades } from "hardhat";

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
  const Greeter = await ethers.getContractFactory("CreatorDAOCommission");
  const greeter = await upgrades.deployBeacon(Greeter);
  await greeter.deployed();
  console.log("CreatorDAOCommission deployed to:", greeter.address);


  const instance = await upgrades.deployBeaconProxy(greeter, Greeter, [deployer.address, deployer.address]);

  // const greeter = await Greeter.deploy(deployer.address, deployer.address);

  await instance.deployed();

  // const greeter = await ethers.getContractFactory("CreatorDAOCommission");


  console.log("BeaconProxy deployed to:", instance.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
