# NiiFi V1 core contracts

The NiiFi V1 contracts follow the same API as Uniswap V2.
In-depth documentation on Uniswap V2 is available at [uniswap.org](https://uniswap.org/docs).
The built contract artifacts can be browsed via [unpkg.com](https://unpkg.com/browse/@uniswap/v2-core@latest/).

# Local Development

The following assumes the use of `node@>=10`.

## Install Dependencies

`yarn`

## Compile Contracts

EVM compiler:
`yarn compile:evm`

NVM compiler:
`yarn compile:nvm`

## Run Tests

EVM compiler:
`yarn test:evm`

NVM compiler:
`yarn test:nvm`

## Generate new hash code
External dependencies depends on the hash of the `NiiFiV1Pair` contract to deterministically find the address of a token pair. This hash can be different based on the Solidity version and number of optimization runs used. 

To generate a new hash code for your specific target, compile the contracts and run the `generate-init-code-hash` the following command in this folder:
`yarn generate-hash`

# Deploy

Deploy to the live Nahmii Ropsten network:
`yarn deploy:nvm`

Alternatively, it is also possible to flatten the smart contracts and deploying them manually.
To flatten the smart contracts run:
`npx hardhat flatten contracts/{contract_name}.sol`