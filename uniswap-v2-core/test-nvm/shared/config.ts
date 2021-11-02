import { ethers } from 'ethers'
import {cleanEnv, str, num} from 'envalid'
require('dotenv').config();

const config = cleanEnv(process.env, {
  L2_URL: str({default: 'http://127.0.0.1:8545'}),
  PRIVATE_KEY: str({default: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'}),
  PRIVATE_KEY_OTHER: str({default: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'}),
  CHAIN_ID: num({default: 555})
})

const provider = new ethers.providers.JsonRpcProvider(config.L2_URL)
provider.getGasPrice = async () => ethers.BigNumber.from(0)
//@ts-ignore
provider.getWallets = () => {
  return [
    new ethers.Wallet(config.PRIVATE_KEY as string).connect(provider),
    new ethers.Wallet(config.PRIVATE_KEY_OTHER as string).connect(provider)
  ]
}

const chainId = ethers.BigNumber.from(config.CHAIN_ID)

export { provider, chainId }