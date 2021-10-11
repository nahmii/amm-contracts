# Uniswap V2

[![Actions Status](https://github.com/Uniswap/uniswap-v2-periphery/workflows/CI/badge.svg)](https://github.com/Uniswap/uniswap-v2-periphery/actions)
[![npm](https://img.shields.io/npm/v/@uniswap/v2-periphery?style=flat-square)](https://npmjs.com/package/@uniswap/v2-periphery)

In-depth documentation on Uniswap V2 is available at [uniswap.org](https://uniswap.org/docs).

The built contract artifacts can be browsed via [unpkg.com](https://unpkg.com/browse/@uniswap/v2-periphery@latest/).

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

## Deploy

NOTE: Prior to deploying, make sure to add a correct `FACTORY_ADDRESS` to the `.env` file. If you don't have one, please deploy the core smart contracts first and retrieve the factory address.

Deploy to the live Nahmii Ropsten network:
`yarn deploy:nvm`

Alternatively, it is also possible to flatten the smart contracts and deploying them manually.
To flatten the smart contracts run:
`npx hardhat flatten contracts/{contract_name}.sol`