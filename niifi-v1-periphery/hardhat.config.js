require("@nomiclabs/hardhat-waffle");
require('@nahmii/hardhat-nvm');
require('dotenv').config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

let accounts
if (process.env.MNEMONIC) {
    accounts = { mnemonic: process.env.MNEMONIC }
}
else {
    accounts = [process.env.PRIVATE_KEY]
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
        version: "0.6.12",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        nahmii: {
            url: process.env.L2_URL,
            accounts,
            gasPrice: process.env.GAS_PRICE ? parseInt(process.env.GAS_PRICE) : "auto",
            gas: process.env.GAS ? parseInt(process.env.GAS) : "auto",
        }
    }
};
