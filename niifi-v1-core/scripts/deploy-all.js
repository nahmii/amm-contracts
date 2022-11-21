// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
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

    // Fee address: If set to 0x0, 0.3% fee goes to pool contributors. 
    // Else, 0.25% goes to fee holders and 0.05% goes to the feeAddress.
    const feeAddress = "0x0000000000000000000000000000000000000000";

    // Deploy factory
    const factory = await hre.ethers.getContractFactory('NiiFiV1Factory');
    const factoryInstance = await factory.deploy(feeAddress);
    await factoryInstance.deployed();

    console.log(`Factory deployed to: ${factoryInstance.address}`);

    // Deploy erc20
    const erc20 = await hre.ethers.getContractFactory('NiiFiV1ERC20');
    const erc20Instance = await erc20.deploy();
    await erc20Instance.deployed();

    console.log(`Niifi deployed to: ${erc20Instance.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
