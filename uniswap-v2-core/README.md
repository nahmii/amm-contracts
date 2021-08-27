# Uniswap V2

[![Actions Status](https://github.com/Uniswap/uniswap-v2-core/workflows/CI/badge.svg)](https://github.com/Uniswap/uniswap-v2-core/actions)
[![Version](https://img.shields.io/npm/v/@uniswap/v2-core)](https://www.npmjs.com/package/@uniswap/v2-core)

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

## Deploy

Deploy to the live Nahmii Ropsten network:
`yarn deploy:nvm`

Alternatively, it is also possible to flatten the smart contracts and deploying them manually.
To flatten the smart contracts run:
`npx hardhat flatten contracts/{contract_name}.sol`