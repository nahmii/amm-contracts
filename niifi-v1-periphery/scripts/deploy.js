// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
require('dotenv').config();
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

    // Get accounts
    [account] = await ethers.getSigners();
    deployerAddress = account.address;
    console.log(`Deploying contracts using ${deployerAddress}`);

    // Wrapped ether address
    const wETH = "0x4200000000000000000000000000000000000006";

    // Factory address
    const factory = process.env.FACTORY_ADDRESS;

    // Deploy router
    const router = await hre.ethers.getContractFactory('NiiFiV1Router02');
    const routerInstance = await router.deploy(factory, wETH);
    await routerInstance.deployed();

    console.log(`Router02 deployed to: ${routerInstance.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });