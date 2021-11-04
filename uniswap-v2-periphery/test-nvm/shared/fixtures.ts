import { Wallet, Contract, ContractFactory } from 'ethers'

import { expandTo18Decimals } from './utilities'

import NiiFiV1Factory from '../../../uniswap-v2-core/artifacts-nvm/contracts/NiiFiV1Factory.sol/NiiFiV1Factory.json'
import INiiFiV1Pair from '../../../uniswap-v2-core/artifacts-nvm/contracts/NiiFiV1Pair.sol/NiiFiV1Pair.json'

import ERC20 from '../../artifacts-ovm/contracts/test/ERC20.sol/ERC20.json'
import WETH9 from '../../artifacts-ovm/contracts/test/WETH9.sol/WETH9.json'
import NiiFiV1Router02 from '../../artifacts-ovm/contracts/NiiFiV1Router02.sol/NiiFiV1Router02.json'
import RouterEventEmitter from '../../artifacts-ovm/contracts/test/RouterEventEmitter.sol/RouterEventEmitter.json'

interface V2Fixture {
  token0: Contract
  token1: Contract
  WETH: Contract
  WETHPartner: Contract
  factoryV2: Contract
  router02: Contract
  routerEventEmitter: Contract
  router: Contract
  pair: Contract
  WETHPair: Contract
}

async function deploy(wallet, contractMeta, args) {
  const factory = new ContractFactory(contractMeta.abi, contractMeta.bytecode, wallet)
  const contract = await factory.deploy(...args)
  await contract.deployed()
  return contract
}

export async function v2Fixture([wallet]: Wallet[], provider: any): Promise<V2Fixture> {
  // deploy tokens
  const tokenA = await deploy(wallet, ERC20, [expandTo18Decimals(10000)])
  const tokenB = await deploy(wallet, ERC20, [expandTo18Decimals(10000)])
  const WETH = new Contract(
    '0x4200000000000000000000000000000000000006', 
    JSON.stringify(WETH9.abi), 
    provider
  ).connect(wallet)
  
  const WETHPartner = await deploy(wallet, ERC20, [expandTo18Decimals(10000)])
  // deploy V2
  let factoryV2
  if (process.env.FACTORY_ADDRESS) {
    factoryV2 = new Contract(
      process.env.FACTORY_ADDRESS, 
      JSON.stringify(NiiFiV1Factory.abi), 
      provider
    ).connect(wallet)

    console.log('Reuse factory address:', factoryV2.address)
  }
  else {
    factoryV2 = await deploy(wallet, NiiFiV1Factory, [wallet.address])

    console.log('Deployed factory:', factoryV2.address)
  }

  // deploy routers
  const router02 = await deploy(wallet, NiiFiV1Router02, [factoryV2.address, WETH.address])

  // event emitter for testing
  const routerEventEmitter = await deploy(wallet, RouterEventEmitter, [])

  // initialize V2
  await factoryV2.createPair(tokenA.address, tokenB.address)
  const pairAddress = await factoryV2.getPair(tokenA.address, tokenB.address)
  const pair = new Contract(pairAddress, JSON.stringify(INiiFiV1Pair.abi), provider).connect(wallet)

  const token0Address = await pair.token0()
  const token0 = tokenA.address === token0Address ? tokenA : tokenB
  const token1 = tokenA.address === token0Address ? tokenB : tokenA

  await factoryV2.createPair(WETH.address, WETHPartner.address)
  const WETHPairAddress = await factoryV2.getPair(WETH.address, WETHPartner.address)
  const WETHPair = new Contract(WETHPairAddress, JSON.stringify(INiiFiV1Pair.abi), provider).connect(wallet)

  return {
    token0,
    token1,
    WETH,
    WETHPartner,
    factoryV2,
    router02,
    router: router02, 
    routerEventEmitter,
    pair,
    WETHPair
  }
}
