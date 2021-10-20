require("@nomiclabs/hardhat-waffle");
require('@eth-optimism/hardhat-ovm');
require('dotenv').config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

const accounts = []
if (process.env.MNEMONIC) {
    accounts.push({ mnemonic: process.env.MNEMONIC })
}
else {
    accounts.push(process.env.PRIVATE_KEY)
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
        version: "0.5.16",
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
            gasPrice: 15000000,
            gas: 9000000,
            ovm: true
        }
    },
    ovm: {
        solcVersion: '0.5.16'
    }
};