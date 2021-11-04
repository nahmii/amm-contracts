import { Contract } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'
import { defaultAbiCoder } from '@ethersproject/abi'
import { getAddress } from '@ethersproject/address'
import { keccak256 } from '@ethersproject/keccak256'
import { pack as solidityPack } from '@ethersproject/solidity'
import { toUtf8Bytes } from '@ethersproject/strings'
import { chainId } from './config'
import { JsonRpcProvider } from "@ethersproject/providers/src.ts/json-rpc-provider";

const PERMIT_TYPEHASH = keccak256(
  toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)')
)

export function expandTo18Decimals(n: number): BigNumber {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(18))
}

function getDomainSeparator(name: string, tokenAddress: string) {
  return keccak256(
    defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [
        keccak256(toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')),
        keccak256(toUtf8Bytes(name)),
        keccak256(toUtf8Bytes('1')),
        chainId,
        tokenAddress
      ]
    )
  )
}

export function getCreate2Address(
  factoryAddress: string,
  [tokenA, tokenB]: [string, string],
  bytecode: string
): string {
  const [token0, token1] = tokenA < tokenB ? [tokenA, tokenB] : [tokenB, tokenA]
  const create2Inputs = [
    '0xff',
    factoryAddress,
    keccak256(solidityPack(['address', 'address'], [token0, token1])),
    keccak256(bytecode)
  ]
  const sanitizedInputs = `0x${create2Inputs.map(i => i.slice(2)).join('')}`
  return getAddress(`0x${keccak256(sanitizedInputs).slice(-40)}`)
}

export async function getApprovalDigest(
  token: Contract,
  approve: {
    owner: string
    spender: string
    value: BigNumber
  },
  nonce: BigNumber,
  deadline: BigNumber
): Promise<string> {
  const name = await token.name()
  const DOMAIN_SEPARATOR = getDomainSeparator(name, token.address)
  return keccak256(
    solidityPack(
      ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
      [
        '0x19',
        '0x01',
        DOMAIN_SEPARATOR,
        keccak256(
          defaultAbiCoder.encode(
            ['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'],
            [PERMIT_TYPEHASH, approve.owner, approve.spender, approve.value, nonce, deadline]
          )
        )
      ]
    )
  )
}

export function encodePrice(reserve0: BigNumber, reserve1: BigNumber, timeElapsed: BigNumber) {
  return [
      reserve1.mul(BigNumber.from(2).pow(112)).div(reserve0).mul(timeElapsed),
      reserve0.mul(BigNumber.from(2).pow(112)).div(reserve1).mul(timeElapsed)
  ]
}

export function addPrice(oldPrice: BigNumber[], addedPrice: BigNumber[]) {
    return [
        oldPrice[0].add(addedPrice[0]),
        oldPrice[1].add(addedPrice[1])
    ]
}

export async function waitBlocks(provider: JsonRpcProvider, numBlocks: number): Promise<number> {
    process.stdout.write(`Waiting ${numBlocks} blocks`)

    return new Promise((resolve) => {
        let blockCount = 0

        const listener = (blockNumber) => {
            process.stdout.write('.')
            blockCount++
            if (blockCount >= numBlocks) {
                provider.off('block', listener)
                console.log()
                resolve(blockNumber)
            }
        }

        provider.on('block', listener)
    })
}
