import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { AddressZero, Zero, MaxUint256 } from '@ethersproject/constants'
import { BigNumber } from '@ethersproject/bignumber'
import { solidity } from 'ethereum-waffle'
import { ecsign } from 'ethereumjs-util'

import { expandTo18Decimals, expandToDecimals, getApprovalDigest, mineBlock, MINIMUM_LIQUIDITY } from './shared/utilities'
import { v2Fixture } from './shared/fixtures'
import { provider } from './shared/config'

chai.use(solidity)

const overrides = {
  gasLimit: 0
}

describe('NiiFiV1Router02', () => {
  //@ts-ignore
  const [wallet] = provider.getWallets()

  let token0: Contract
  let token1: Contract
  let WETH: Contract
  let WETHPartner: Contract
  let factory: Contract
  let router: Contract
  let pair: Contract
  let WETHPair: Contract
  let routerEventEmitter: Contract
  beforeEach(async function() {
    const fixture = await v2Fixture([wallet], provider)
    token0 = fixture.token0
    token1 = fixture.token1
    WETH = fixture.WETH
    WETHPartner = fixture.WETHPartner
    factory = fixture.factoryV2
    router = fixture.router02
    pair = fixture.pair
    WETHPair = fixture.WETHPair
    routerEventEmitter = fixture.routerEventEmitter
  })

  afterEach(async function() {
    expect(await provider.getBalance(router.address)).to.eq(Zero)
  })

  async function addLiquidity(
    token0Amount: BigNumber, 
    token1Amount: BigNumber, 
    override: {token0?: Contract, token1?: Contract, pair?: Contract} = {}
    ) {
    const _token0 = override.token0 || token0
    const _token1 = override.token1 || token1
    const _pair = override.pair || pair

    await _token0.transfer(_pair.address, token0Amount)
    await _token1.transfer(_pair.address, token1Amount)
    await _pair.mint(wallet.address, overrides)
  }

  it('factory, WETH', async () => {
    expect(await router.factory()).to.eq(factory.address)
    expect(await router.WETH()).to.eq(WETH.address)
  })
  
  describe('token', () => {
    it('addLiquidity', async () => {
      const token0Amount = expandTo18Decimals(1)
      const token1Amount = expandTo18Decimals(4)

      const expectedLiquidity = expandTo18Decimals(2)
      await token0.approve(router.address, MaxUint256)
      await token1.approve(router.address, MaxUint256)
      await expect(
        router.addLiquidity(
          token0.address,
          token1.address,
          token0Amount,
          token1Amount,
          0,
          0,
          wallet.address,
          MaxUint256,
          overrides
        )
      )
        .to.emit(token0, 'Transfer')
        .withArgs(wallet.address, pair.address, token0Amount)
        .to.emit(token1, 'Transfer')
        .withArgs(wallet.address, pair.address, token1Amount)
        .to.emit(pair, 'Transfer')
        .withArgs(AddressZero, AddressZero, MINIMUM_LIQUIDITY)
        .to.emit(pair, 'Transfer')
        .withArgs(AddressZero, wallet.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
        .to.emit(pair, 'Sync')
        .withArgs(token0Amount, token1Amount)
        .to.emit(pair, 'Mint')
        .withArgs(router.address, token0Amount, token1Amount)

      expect(await pair.balanceOf(wallet.address)).to.eq(expectedLiquidity.sub(MINIMUM_LIQUIDITY))
    })
    
    it('removeLiquidity', async () => {
      const token0Amount = expandTo18Decimals(1)
      const token1Amount = expandTo18Decimals(4)
      await addLiquidity(token0Amount, token1Amount, {token0, token1, pair})

      const expectedLiquidity = expandTo18Decimals(2)
      await pair.approve(router.address, MaxUint256)
      await expect(
        router.removeLiquidity(
          token0.address,
          token1.address,
          expectedLiquidity.sub(MINIMUM_LIQUIDITY),
          0,
          0,
          wallet.address,
          MaxUint256,
          overrides
        )
      )
        .to.emit(pair, 'Transfer')
        .withArgs(wallet.address, pair.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
        .to.emit(pair, 'Transfer')
        .withArgs(pair.address, AddressZero, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
        .to.emit(token0, 'Transfer')
        .withArgs(pair.address, wallet.address, token0Amount.sub(500))
        .to.emit(token1, 'Transfer')
        .withArgs(pair.address, wallet.address, token1Amount.sub(2000))
        .to.emit(pair, 'Sync')
        .withArgs(500, 2000)
        .to.emit(pair, 'Burn')
        .withArgs(router.address, token0Amount.sub(500), token1Amount.sub(2000), wallet.address)

      expect(await pair.balanceOf(wallet.address)).to.eq(0)
      const totalSupplyToken0 = await token0.totalSupply()
      const totalSupplyToken1 = await token1.totalSupply()
      expect(await token0.balanceOf(wallet.address)).to.eq(totalSupplyToken0.sub(500))
      expect(await token1.balanceOf(wallet.address)).to.eq(totalSupplyToken1.sub(2000))
    })

    it('removeLiquidityWithPermit', async () => {
      const token0Amount = expandTo18Decimals(1)
      const token1Amount = expandTo18Decimals(4)
      await addLiquidity(token0Amount, token1Amount, {token0, token1, pair})

      const expectedLiquidity = expandTo18Decimals(2)

      const nonce = await pair.nonces(wallet.address)
      const digest = await getApprovalDigest(
        pair,
        { owner: wallet.address, spender: router.address, value: expectedLiquidity.sub(MINIMUM_LIQUIDITY) },
        nonce,
        MaxUint256
      )

      const { v, r, s } = ecsign(Buffer.from(digest.slice(2), 'hex'), Buffer.from(wallet.privateKey.slice(2), 'hex'))

      await router.removeLiquidityWithPermit(
        token0.address,
        token1.address,
        expectedLiquidity.sub(MINIMUM_LIQUIDITY),
        0,
        0,
        wallet.address,
        MaxUint256,
        false,
        v,
        r,
        s,
        overrides
      )
    })

    describe('swapExactTokensForTokens', () => {
      const token0Amount = expandTo18Decimals(5)
      const token1Amount = expandTo18Decimals(10)
      const swapAmount = expandTo18Decimals(1)
      const expectedOutputAmount = BigNumber.from('1662497915624478906')

      beforeEach(async () => {
        await addLiquidity(token0Amount, token1Amount, {token0, token1, pair})
        await token0.approve(router.address, MaxUint256)
      })

      it('happy path', async () => {
        await expect(
          router.swapExactTokensForTokens(
            swapAmount,
            0,
            [token0.address, token1.address],
            wallet.address,
            MaxUint256,
            overrides
          )
        )
          .to.emit(token0, 'Transfer')
          .withArgs(wallet.address, pair.address, swapAmount)
          .to.emit(token1, 'Transfer')
          .withArgs(pair.address, wallet.address, expectedOutputAmount)
          .to.emit(pair, 'Sync')
          .withArgs(token0Amount.add(swapAmount), token1Amount.sub(expectedOutputAmount))
          .to.emit(pair, 'Swap')
          .withArgs(router.address, swapAmount, 0, 0, expectedOutputAmount, wallet.address)
      })

      it('amounts', async () => {
        await token0.approve(routerEventEmitter.address, MaxUint256)
        await expect(
          routerEventEmitter.swapExactTokensForTokens(
            router.address,
            swapAmount,
            0,
            [token0.address, token1.address],
            wallet.address,
            MaxUint256,
            overrides
          )
        )
          .to.emit(routerEventEmitter, 'Amounts')
          .withArgs([swapAmount, expectedOutputAmount])
      })

      // xit('gas', async () => {
      //   // ensure that setting price{0,1}CumulativeLast for the first time doesn't affect our gas math
      //   await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)
      //   await pair.sync(overrides)

      //   await token0.approve(router.address, MaxUint256)
      //   await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)
      //   const tx = await router.swapExactTokensForTokens(
      //     swapAmount,
      //     0,
      //     [token0.address, token1.address],
      //     wallet.address,
      //     MaxUint256,
      //     overrides
      //   )
      //   const receipt = await tx.wait()
      //   expect(receipt.gasUsed).to.eq(
      //     {
      //       [RouterVersion.UniswapV2Router01]: 101876,
      //       [RouterVersion.UniswapV2Router02]: 101898
      //     }[routerVersion as RouterVersion]
      //   )
      // }).retries(3)
    })

    describe('swapTokensForExactTokens', () => {
      const token0Amount = expandTo18Decimals(5)
      const token1Amount = expandTo18Decimals(10)
      const expectedSwapAmount = BigNumber.from('557227237267357629')
      const outputAmount = expandTo18Decimals(1)

      beforeEach(async () => {
        await addLiquidity(token0Amount, token1Amount, {token0, token1, pair})
      })

      it('happy path', async () => {
        await token0.approve(router.address, MaxUint256)
        await expect(
          router.swapTokensForExactTokens(
            outputAmount,
            MaxUint256,
            [token0.address, token1.address],
            wallet.address,
            MaxUint256,
            overrides
          )
        )
          .to.emit(token0, 'Transfer')
          .withArgs(wallet.address, pair.address, expectedSwapAmount)
          .to.emit(token1, 'Transfer')
          .withArgs(pair.address, wallet.address, outputAmount)
          .to.emit(pair, 'Sync')
          .withArgs(token0Amount.add(expectedSwapAmount), token1Amount.sub(outputAmount))
          .to.emit(pair, 'Swap')
          .withArgs(router.address, expectedSwapAmount, 0, 0, outputAmount, wallet.address)
      })

      it('amounts', async () => {
        await token0.approve(routerEventEmitter.address, MaxUint256)
        await expect(
          routerEventEmitter.swapTokensForExactTokens(
            router.address,
            outputAmount,
            MaxUint256,
            [token0.address, token1.address],
            wallet.address,
            MaxUint256,
            overrides
          )
        )
          .to.emit(routerEventEmitter, 'Amounts')
          .withArgs([expectedSwapAmount, outputAmount])
      })
    })
  });

  describe('ETH', () => {
    it('addLiquidity', async () => {
      const wETHAmount = expandToDecimals(1, 15)
      const WETHPartnerAmount = expandToDecimals(4, 15)

      const expectedLiquidity = expandToDecimals(2, 15)
      await WETH.approve(router.address, MaxUint256)
      await WETHPartner.approve(router.address, MaxUint256)
      await expect(
        router.addLiquidity(
          WETH.address,
          WETHPartner.address,
          wETHAmount,
          WETHPartnerAmount,
          0,
          0,
          wallet.address,
          MaxUint256,
          overrides
        )
      )
        .to.emit(WETH, 'Transfer')
        .withArgs(wallet.address, WETHPair.address, wETHAmount)
        .to.emit(WETHPartner, 'Transfer')
        .withArgs(wallet.address, WETHPair.address, WETHPartnerAmount)
        .to.emit(WETHPair, 'Transfer')
        .withArgs(AddressZero, AddressZero, MINIMUM_LIQUIDITY)
        .to.emit(WETHPair, 'Transfer')
        .withArgs(AddressZero, wallet.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
        .to.emit(WETHPair, 'Sync')
        .withArgs(wETHAmount, WETHPartnerAmount)
        .to.emit(WETHPair, 'Mint')
        .withArgs(router.address, wETHAmount, WETHPartnerAmount)

      expect(await WETHPair.balanceOf(wallet.address)).to.eq(expectedLiquidity.sub(MINIMUM_LIQUIDITY))
    })

    it('removeLiquidity', async () => {
      const wETHAmount = expandToDecimals(1, 15)
      const WETHPartnerAmount = expandToDecimals(4, 15)

      await addLiquidity(wETHAmount, WETHPartnerAmount, {token0: WETH, token1: WETHPartner, pair: WETHPair})

      const expectedLiquidity = expandToDecimals(2, 15)
      await WETHPair.approve(router.address, MaxUint256)
      await expect(
        router.removeLiquidity(
          WETH.address,
          WETHPartner.address,
          expectedLiquidity.sub(MINIMUM_LIQUIDITY),
          0,
          0,
          wallet.address,
          MaxUint256,
          overrides
        )
      )
        .to.emit(WETHPair, 'Transfer')
        .withArgs(wallet.address, WETHPair.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
        .to.emit(WETHPair, 'Transfer')
        .withArgs(WETHPair.address, AddressZero, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
        .to.emit(WETH, 'Transfer')
        .withArgs(WETHPair.address, wallet.address, wETHAmount.sub(500))
        .to.emit(WETHPartner, 'Transfer')
        .withArgs(WETHPair.address, wallet.address, WETHPartnerAmount.sub(2000))
        .to.emit(WETHPair, 'Sync')
        .withArgs(500, 2000)
        .to.emit(WETHPair, 'Burn')
        .withArgs(router.address, wETHAmount.sub(500), WETHPartnerAmount.sub(2000), wallet.address)

      expect(await WETHPair.balanceOf(wallet.address)).to.eq(0)
      // const totalSupplyWETH = await WETH.totalSupply()
      // const totalSupplyWETHPartner = await WETHPartner.totalSupply()
      // // expect(await WETH.balanceOf(wallet.address)).to.eq(totalSupplyWETH.sub(500))
      // expect(await WETHPartner.balanceOf(wallet.address)).to.eq(totalSupplyWETHPartner.sub(2000))
    })

    it('removeLiquidityWithPermit', async () => {
      const wETHAmount = expandToDecimals(1, 15)
      const WETHPartnerAmount = expandToDecimals(4, 15)

      await addLiquidity(wETHAmount, WETHPartnerAmount, {token0: WETH, token1: WETHPartner, pair: WETHPair})

      const expectedLiquidity = expandToDecimals(2, 15)

      const nonce = await WETHPair.nonces(wallet.address)
      const digest = await getApprovalDigest(
        WETHPair,
        { owner: wallet.address, spender: router.address, value: expectedLiquidity.sub(MINIMUM_LIQUIDITY) },
        nonce,
        MaxUint256
      )

      const { v, r, s } = ecsign(Buffer.from(digest.slice(2), 'hex'), Buffer.from(wallet.privateKey.slice(2), 'hex'))

      await router.removeLiquidityWithPermit(
        WETH.address,
        WETHPartner.address,
        expectedLiquidity.sub(MINIMUM_LIQUIDITY),
        0,
        0,
        wallet.address,
        MaxUint256,
        false,
        v,
        r,
        s,
        overrides
      )
    })

    describe('swapExactTokensForTokens', () => {
      const wETHAmount = expandToDecimals(5, 15)
      const WETHPartnerAmount = expandToDecimals(10, 15)

      const swapAmount = expandToDecimals(1, 15)
      const expectedOutputAmount = BigNumber.from('1662497915624478')
      
      beforeEach(async () => {
        await addLiquidity(wETHAmount, WETHPartnerAmount, {token0: WETH, token1: WETHPartner, pair: WETHPair})
        await WETH.approve(router.address, MaxUint256)
      })

      it('happy path', async () => {
        await expect(
          router.swapExactTokensForTokens(
            swapAmount,
            0,
            [WETH.address, WETHPartner.address],
            wallet.address,
            MaxUint256,
            overrides
          )
        )
          .to.emit(WETH, 'Transfer')
          .withArgs(wallet.address, WETHPair.address, swapAmount)
          .to.emit(WETHPartner, 'Transfer')
          .withArgs(WETHPair.address, wallet.address, expectedOutputAmount)
          .to.emit(WETHPair, 'Sync')
          .withArgs(wETHAmount.add(swapAmount), WETHPartnerAmount.sub(expectedOutputAmount))
          .to.emit(WETHPair, 'Swap')
          .withArgs(router.address, swapAmount, 0, 0, expectedOutputAmount, wallet.address)
      })

      it('amounts', async () => {
        await WETH.approve(routerEventEmitter.address, MaxUint256)
        await expect(
          routerEventEmitter.swapExactTokensForTokens(
            router.address,
            swapAmount,
            0,
            [WETH.address, WETHPartner.address],
            wallet.address,
            MaxUint256,
            overrides
          )
        )
          .to.emit(routerEventEmitter, 'Amounts')
          .withArgs([swapAmount, expectedOutputAmount])
      })

    })

    describe('swapTokensForExactTokens', () => {
      const wETHAmount = expandToDecimals(5, 15)
      const WETHPartnerAmount = expandToDecimals(10, 15)

      const expectedSwapAmount = BigNumber.from('557227237267358')
      const outputAmount = expandToDecimals(1, 15)

      beforeEach(async () => {
        await addLiquidity(wETHAmount, WETHPartnerAmount, {token0: WETH, token1: WETHPartner, pair: WETHPair})
      })

      it('happy path', async () => {
        await WETH.approve(router.address, MaxUint256)
        await expect(
          router.swapTokensForExactTokens(
            outputAmount,
            MaxUint256,
            [WETH.address, WETHPartner.address],
            wallet.address,
            MaxUint256,
            overrides
          )
        )
          .to.emit(WETH, 'Transfer')
          .withArgs(wallet.address, WETHPair.address, expectedSwapAmount)
          .to.emit(WETHPartner, 'Transfer')
          .withArgs(WETHPair.address, wallet.address, outputAmount)
          .to.emit(WETHPair, 'Sync')
          .withArgs(wETHAmount.add(expectedSwapAmount), WETHPartnerAmount.sub(outputAmount))
          .to.emit(WETHPair, 'Swap')
          .withArgs(router.address, expectedSwapAmount, 0, 0, outputAmount, wallet.address)
      })

      it('amounts', async () => {
        await WETH.approve(routerEventEmitter.address, MaxUint256)
        await expect(
          routerEventEmitter.swapTokensForExactTokens(
            router.address,
            outputAmount,
            MaxUint256,
            [WETH.address, WETHPartner.address],
            wallet.address,
            MaxUint256,
            overrides
          )
        )
          .to.emit(routerEventEmitter, 'Amounts')
          .withArgs([expectedSwapAmount, outputAmount])
      })
    })
  });
})
