# NiiFi exchange smart contracts

This repository contains both the NiiFi uniswap forked v2-core and v2-periphery repositories. Changes versus the original repositories are:
- Compatibility with the Nahmii Virtual Machine (NVM).
- Updated Waffle from V2 to V3.
- Updated tests to work with Waffle V3.
- Generalized test configuration. (less duplication)
- Compiler options for both the EVM and the NVM.
- Updated WETH9 smart contract to work with the NVM.
- Hardhat integration.
- Deploy scripts for the Nahmii Ropsten network.

## Requirements

Tested with:
- Nodejs v16.5.0
- Ubuntu 20.04

## Architecture

This repository contains 2 different solidity projects with two different compiler versions:
- uniswap-v2-core -> Solidity 0.5.16
- uniswap-v2-periphery -> Solidity 0.6.12

The `core` project contains the main file to be deployed, the `UniswapV2Factory` contract. The `periphery` project contains the `UniswapV2Router02` contract, which is required for routing swaps and liquidity actions between pairs. There are flattened files available for both contracts too.