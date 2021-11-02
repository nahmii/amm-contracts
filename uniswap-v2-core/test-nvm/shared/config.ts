import { ethers } from 'ethers'
require('dotenv').config();

const config = {
  l2Url: process.env.L2_URL || 'http://127.0.0.1:8545',
  pkAccountOne: process.env.PRIVATE_KEY,
  pkAccountTwo: process.env.PRIVATE_KEY_OTHER,
  chainId: ethers.BigNumber.from(process.env.CHAIN_ID || 555)
}

const provider = new ethers.providers.JsonRpcProvider(config.l2Url)
provider.getGasPrice = async () => ethers.BigNumber.from(0)
//@ts-ignore
provider.getWallets = () => {
  return [
    new ethers.Wallet(config.pkAccountOne as string).connect(provider),
    new ethers.Wallet(config.pkAccountTwo as string).connect(provider)
  ]
}

const chainId = config.chainId

export { provider, chainId }