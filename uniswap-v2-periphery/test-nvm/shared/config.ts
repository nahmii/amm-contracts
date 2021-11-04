import { ethers } from 'ethers'
require('dotenv').config();

const config = {
  l2Url: process.env.L2_URL || 'http://127.0.0.1:8545',
  l2ChainId: ethers.BigNumber.from(process.env.L2_CHAIN_ID || 555),
  privateKey: process.env.PRIVATE_KEY
}

const l2Provider = new ethers.providers.JsonRpcProvider(config.l2Url)
l2Provider.getGasPrice = async () => ethers.BigNumber.from(0)
//@ts-ignore
l2Provider.getWallets = () => {
  return [
    new ethers.Wallet(config.privateKey as string).connect(l2Provider),
  ]
}

const l2ChainId = config.l2ChainId

export { l2Provider, l2ChainId }