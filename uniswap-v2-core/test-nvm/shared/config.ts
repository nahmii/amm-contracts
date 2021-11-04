import { ethers } from 'ethers'
import {cleanEnv, str, num} from 'envalid'
require('dotenv').config();

const config = cleanEnv(process.env, {
  L1_URL: str({default: 'http://127.0.0.1:9545'}),
  L2_URL: str({default: 'http://127.0.0.1:8545'}),
  L2_CHAIN_ID: num({default: 555}),
  PRIVATE_KEY: str({default: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'}),
  PRIVATE_KEY_OTHER: str({default: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'}),
  L1_BLOCK_WAIT: num({default: 3}),
  L1_BLOCK_TIME: num({default: 25})
})

const l1Provider = new ethers.providers.JsonRpcProvider(config.L1_URL)

const l2Provider = new ethers.providers.JsonRpcProvider(config.L2_URL)
l2Provider.getGasPrice = async () => ethers.BigNumber.from(0)
//@ts-ignore
l2Provider.getWallets = () => {
  return [
    new ethers.Wallet(config.PRIVATE_KEY as string).connect(l2Provider),
    new ethers.Wallet(config.PRIVATE_KEY_OTHER as string).connect(l2Provider)
  ]
}

const l2ChainId = ethers.BigNumber.from(config.L2_CHAIN_ID)

const l1BlockWait = config.L1_BLOCK_WAIT
const l1BlockTime = config.L1_BLOCK_TIME

export { l1Provider, l2Provider, l2ChainId, l1BlockWait, l1BlockTime }