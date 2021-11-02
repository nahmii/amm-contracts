import { Contract, ContractFactory, Wallet } from 'ethers'
import { AddressZero } from '@ethersproject/constants'
import { expandTo18Decimals } from './utilities'

import ERC20 from '../../artifacts-ovm/contracts/test/ERC20.sol/ERC20.json'
import NiiFiV1Factory from '../../artifacts-ovm/contracts/NiiFiV1Factory.sol/NiiFiV1Factory.json'
import NiiFiV1Pair from '../../artifacts-ovm/contracts/NiiFiV1Pair.sol/NiiFiV1Pair.json'

interface FactoryFixture {
  factory: Contract
}

export async function deploy(wallet, contractMeta, args) {
  const factory = new ContractFactory(contractMeta.abi, contractMeta.bytecode, wallet)
  const contract = await factory.deploy(...args)
  await contract.deployed()
  return contract
}

export async function factoryFixture([wallet]: Wallet[], provider: any): Promise<FactoryFixture> {
  const factory = await deploy(wallet, NiiFiV1Factory, [wallet.address])
  console.log('Deployed factory:', factory.address)
  
  return { factory }
}

interface PairFixture extends FactoryFixture {
  token0: Contract
  token1: Contract
  pair: Contract
}

export async function pairFixture([wallet]: Wallet[], provider: any): Promise<PairFixture> {
  const { factory } = await factoryFixture([wallet], provider)

  const tokenA = await deploy(wallet, ERC20, [expandTo18Decimals(10000)])
  const tokenB = await deploy(wallet, ERC20, [expandTo18Decimals(10000)])

  await factory.createPair(tokenA.address, tokenB.address)
  const pairAddress = await factory.getPair(tokenA.address, tokenB.address)
  const pair = new Contract(pairAddress, JSON.stringify(NiiFiV1Pair.abi), provider).connect(wallet)

  const token0Address = (await pair.token0()).address
  const token0 = tokenA.address === token0Address ? tokenA : tokenB
  const token1 = tokenA.address === token0Address ? tokenB : tokenA

  return { factory, token0, token1, pair }
}
