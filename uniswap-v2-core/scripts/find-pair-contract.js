const { ethers } = require("hardhat");

// The input data below generates the NII-wETH pair for Uniswap on the Ethereum mainnet.
// The order of the tokens matters. In V2 pairs, the smaller hex number is always first.
const token0 = "0x7c8155909cd385F120A56eF90728dD50F9CcbE52";
const token1 = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const FACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
// To generate an INIT_CODE_HASH, see the `generate-init-code-hash.js` script.
const INIT_CODE_HASH = "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f";

async function main() {
    const pairAddress = ethers.utils.getCreate2Address(
        FACTORY_ADDRESS,
        ethers.utils.solidityKeccak256(["bytes"], [ethers.utils.solidityPack(["address", "address"], [token0, token1])]),
        INIT_CODE_HASH
    );
    console.log(`The pair address for token0 (${token0}) and token1 (${token1}) is ${pairAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });