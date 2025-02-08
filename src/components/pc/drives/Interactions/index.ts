'use server'
import {
  Para as ParaServer,
  Environment,
  SuccessfulSignatureRes,
} from '@getpara/server-sdk'
import { categorizeIdentifier } from '../Extensions/utils'
import {
  custom,
  http,
  sendTransaction,
  PrepareTransactionRequestParameters,
} from '@wagmi/core'
import { baseSepolia, mainnet, sepolia } from '@wagmi/core/chains'
import {
  createParaAccount,
  createParaViemClient,
} from '@getpara/viem-v2-integration'
import { RLP } from '@ethereumjs/rlp'
import {
  createPublicClient,
  encodeFunctionData,
  nonceManager,
  parseEther,
  parseGwei,
} from 'viem'

export const PublicClientInteractionsList = (account: any, chainId: number) => {
  const infuraKey = process.env.NEXT_PUBLIC_INFURA_KEY
  switch (chainId) {
    case 1: {
      return {
        account: account,
        chain: mainnet,
        transport: http(`https://mainnet.infura.io/v3/${infuraKey}`),
      }
    }

    case 11155111:
      return {
        account: account,
        chain: sepolia,
        transport: http(`https://sepolia.infura.io/v3/${infuraKey}`),
      }
    case 84532:
      return {
        account: account,
        chain: baseSepolia,
        transport: http(`https://base-sepolia.infura.io/v3/${infuraKey}`),
      }
    default: {
      return {
        account: account,
        chain: baseSepolia,
        transport: http(`https://base-sepolia.infura.io/v3/${infuraKey}`),
      }
    }
  }
}

/**
 * Prepares, signs and sends a transaction using a Para wallet server
 * @notice This function handles the full transaction flow from preparation to sending
 * @param userShare The user's share of the wallet key
 * @param abi The ABI of the contract being interacted with
 * @param toAddress The destination address for the transaction
 * @param functionName The name of the function to call
 * @param args The arguments to pass to the function
 * @param chainId The ID of the chain to send the transaction on
 * @param value The amount of ETH to send with the transaction (in ETH units)
 * @returns The transaction hash if successful, undefined if failed
 */
export const PrepareAndSignTransactionWithPregenWalletServer = async ({
  userShare,
  abi,
  toAddress,
  functionName,
  args,
  chainId,
  value,
}: {
  userShare?: string
  walletId?: string
  abi?: any[]
  toAddress?: `0x${string}`
  functionName?: string
  args?: any[]
  chainId?: number
  value?: string
}) => {
  try {
    const paraClient = new ParaServer(
      Environment.BETA,
      process.env.NEXT_PUBLIC_PARA_API_KEY
    )
    await paraClient.setUserShare(userShare!)
    const data = encodeFunctionData({
      abi: abi!,
      functionName: functionName!,
      args: args!,
    })
    const viemCapsuleAccount = createParaAccount(paraClient)
    const viemClient = createParaViemClient(
      paraClient,
      PublicClientInteractionsList(viemCapsuleAccount, chainId!)
    )

    const request = await viemClient.prepareTransactionRequest({
      account: viemCapsuleAccount,
      to: toAddress,
      value: value ? parseEther(value!) : parseEther('0'),
      data: data ? data : '0x',
      chain: PublicClientInteractionsList(viemCapsuleAccount, chainId!).chain,
    })
    const signatureResult = await viemClient.signTransaction({
      ...request,
      chain: request.chain as any,
    })
    const hash = await viemClient.sendRawTransaction({
      serializedTransaction: signatureResult,
    })
    return hash
  } catch (e) {
    console.log('SignTransactionWithPregenWalletServer Failed: ', e)
  }
}

export const SignMessageWithPregenWallet = async (
  userShare: string,
  walletId: string,
  message: string
) => {
  const para = new ParaServer(
    Environment.BETA,
    process.env.NEXT_PUBLIC_PARA_API_KEY
  )

  await para.setUserShare(userShare)
  const messageBase64 = btoa(message)
  const signature = await para.signMessage({
    walletId,
    messageBase64,
  })
  return signature
}

export const UpdateAndClaimPregenWallet = async (
  pregenIdentifier: string,
  walletId: string
) => {
  const para = new ParaServer(
    Environment.BETA,
    process.env.NEXT_PUBLIC_PARA_API_KEY
  )

  await para.updatePregenWalletIdentifier({
    walletId,
    newPregenIdentifier: pregenIdentifier,
    newPregenIdentifierType: categorizeIdentifier(pregenIdentifier),
  })

  const recoverySecret = await para.claimPregenWallets({
    pregenIdentifier: pregenIdentifier,
    pregenIdentifierType: categorizeIdentifier(pregenIdentifier),
  })
  return recoverySecret
}
