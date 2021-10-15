// Functionality to generate the INIT_CODE_HASH for the pair contract.
// This INIT_CODE_HASH is required to compute the pair contract for two given tokens.
// The INIT_CODE_HASH variable can be found in the V2 Router02 smart contract.
const { ethers } = require("hardhat");
let pair;
try {
    pair = require('../build/UniswapV2Pair.json')
} catch (error) {
    if (error.code == "MODULE_NOT_FOUND") {
        console.error("Please compile the smart contracts first by running `yarn compile:nvm`.");
        process.exit(1);
    }
}

async function main() {
    // Retrieve the bytecode from the V2Pair metadata
    const bytecode = pair["evm"]["bytecode"]["object"];
    // Calculate the KECCAK256 hash for the given bytecode.
    const COMPUTED_INIT_CODE_HASH = ethers.utils.keccak256(`0x${bytecode}`);
    console.log(`INIT_CODE_HASH: ${COMPUTED_INIT_CODE_HASH}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });