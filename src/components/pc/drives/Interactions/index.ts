'use server'
import {
  Para as ParaServer,
  Environment,
  hexStringToBase64,
  SuccessfulSignatureRes,
} from '@getpara/server-sdk'
import { categorizeIdentifier } from '../Extensions/utils'
import { http } from '@wagmi/core'

import {
  createParaAccount,
  createParaViemClient,
} from '@getpara/viem-v2-integration'
import {
  encodeFunctionData,
  hashMessage,
  SignableMessage,
  Hash,
  parseEther,
} from 'viem'

import { createModularAccountAlchemyClient } from '@alchemy/aa-alchemy'
import {
  LocalAccountSigner,
  mainnet,
  sepolia,
  baseSepolia,
  SmartAccountSigner,
  WalletClientSigner,
} from '@alchemy/aa-core'
import { SendUserOperationResult } from '@alchemy/aa-core'

export const PublicClientInteractionsList = (account: any, chainId: number) => {
  const infuraKey = process.env.NEXT_PUBLIC_INFURA_KEY
  const blastAPIKey = process.env.NEXT_PUBLIC_BLAST_API_KEY
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
        transport: http(`https://base-sepolia.blastapi.io/${blastAPIKey}`),
      }
    default: {
      return {
        account: account,
        chain: baseSepolia,
        transport: http(`https://base-sepolia.blastapi.io/${blastAPIKey}`),
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
    let data
    if (abi && functionName && args!) {
      data = encodeFunctionData({
        abi: abi!,
        functionName: functionName!,
        args: args!,
      })
    }

    const viemCapsuleAccount = createParaAccount(paraClient)
    const viemClient = createParaViemClient(
      paraClient,
      PublicClientInteractionsList(viemCapsuleAccount, chainId!)
    )

    const request = await viemClient.prepareTransactionRequest({
      account: viemCapsuleAccount,
      to: toAddress,
      value: value ? BigInt(value!) : BigInt('0'),
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

export const PrepareAndSignSponsoredTransactionWithPregenWalletServer = async ({
  userShare,
  walletId,
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

    const alchemyAPI_key = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
    const alchemyGasPolicyId = process.env.NEXT_PUBLIC_ALCHEMY_GAS_POLICY_ID

    await paraClient.setUserShare(userShare!)
    let data
    if (abi && functionName && args) {
      data = encodeFunctionData({
        abi: abi!,
        functionName: functionName!,
        args: args!,
      })
    }
    const viemCapsuleAccount = createParaAccount(paraClient)
    const interactionList = PublicClientInteractionsList(
      viemCapsuleAccount,
      chainId!
    )
    const viemClient = createParaViemClient(paraClient, interactionList)

    viemClient.signMessage = async ({
      message,
    }: {
      message: SignableMessage
    }): Promise<Hash> => {
      return customSignMessage(paraClient, message)
    }
    const walletClientSigner = new WalletClientSigner(viemClient, 'para')

    const alchemyClientWithGas = await createModularAccountAlchemyClient({
      apiKey: alchemyAPI_key!,
      chain: baseSepolia,
      signer: walletClientSigner,
      gasManagerConfig: {
        policyId: alchemyGasPolicyId!,
      },
    })

    const UserOperations = {
      target: toAddress!,
      data: data || '0x',
      value: value ? BigInt(value) : BigInt('0'),
    }

    // Execute the operations
    const userOperationResult = await alchemyClientWithGas.sendUserOperation({
      uo: UserOperations,
    })
    // Wait for the operation to be included in a block
    const txHash = await alchemyClientWithGas.waitForUserOperationTransaction({
      hash: userOperationResult.hash,
    })
    return txHash
  } catch (e) {
    console.log('SignTransactionWithSponsoredPregenWalletServer Failed: ', e)
  }
}

export async function customSignMessage(
  para: ParaServer,
  message: SignableMessage
): Promise<Hash> {
  const hashedMessage = hashMessage(message)
  const res = await para.signMessage({
    walletId: Object.values(para.wallets!)[0]!.id,
    messageBase64: hexStringToBase64(hashedMessage),
  })
  let signature = (res as SuccessfulSignatureRes).signature
  // Fix the v value of the signature
  const lastByte = parseInt(signature.slice(-2), 16)
  if (lastByte < 27) {
    const adjustedV = (lastByte + 27).toString(16).padStart(2, '0')
    signature = signature.slice(0, -2) + adjustedV
  }

  return `0x${signature}`
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
