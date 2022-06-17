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
  const dao = "0x4a44a94dFcd91d6A269fEF0F167133f3231A7338";
  console.log(deployer.address);
  const Greeter = await ethers.getContractFactory("CreatorDAOCommission");
  const proxy = await upgrades.deployProxy(Greeter, [deployer.address, dao]);
  await proxy.deployed();
  console.log("CreatorDAOCommission deployed to:", proxy.address);

  // const greeter = await Greeter.deploy(deployer.address, deployer.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
