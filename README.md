# NiiFi exchange smart contracts

This repository contains both the NiiFi uniswap forked v2-core and v2-periphery repositories. Changes versus the original repositories are:
- Compatibility with the Nahmii Virtual Machine (NVM).
- Updated Waffle from V2 to V3.
- Updated tests to work with Waffle V3.
- Generalized test configuration. (less duplication)
- Compiler options for both the EVM and the NVM.
- Updated WETH9 smart contract to work with the NVM.
- Hardhat integration.
- Deploy scripts for the Nahmii Testnet network.
- Updated pair parameters. 
- Updated error strings.

## Requirements

Tested with:
- Nodejs v16.5.0
- Ubuntu 20.04

## Architecture

This repository contains 2 different solidity projects with two different compiler versions:
- uniswap-v2-core -> Solidity 0.5.16
- uniswap-v2-periphery -> Solidity 0.6.12

The `core` project contains the main file to be deployed, the `NiiFiV1Factory` contract. The `periphery` project contains the `UniswapV2Router02` contract, which is required for routing swaps and liquidity actions between pairs. There are flattened files available for both contracts too.

## Deployed contracts

### Nahmii Testnet

- Factory: 0x11AB0Ca40B2E9Bf2c98718539cA1aD7486999E57
- INIT_CODE_HASH: 0x0afcd21f90e27818df9c484881aac8a20b869cbd86156c655d2020ef6950a5ba
- Router02: 0x682E2F5C4ad4106154EC11F92E96F6CBd01128bC
- NEURO: 0xB59C984a529490fde6698702342b292840743bb8
- NUSD: 0xab151cD390C6b0eB41A4a45E1E372972C3067b1a
- NEURO-NUSD pair: 0x136ff75c58BAa3c30d282fBbFaEC4A5C9A4B0226
- NEURO-ETH pair: 0x1450f8e037D7275ed2aE467af356603521251a13 
