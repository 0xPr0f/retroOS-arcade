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
  createPublicClient,
  hashMessage,
  Hash,
  SignableMessage,
} from 'viem'

import { mainnet, sepolia, baseSepolia } from 'viem/chains'
import { KERNEL_V3_1, getEntryPoint } from '@zerodev/sdk/constants'
import { createKernelAccountClient } from '@zerodev/sdk'
import { createKernelAccount } from '@zerodev/sdk'
import {
  createZeroDevPaymasterClient,
  getUserOperationGasPrice,
} from '@zerodev/sdk'
import {
  getKernelAddressFromECDSA,
  signerToEcdsaValidator,
} from '@zerodev/ecdsa-validator'

const PublicClientInteractionsList = ({
  chainId,
  account,
}: {
  chainId: number
  account?: any
}) => {
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
  walletId,
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
    const [paraClient, data] = await Promise.all([
      (async () => {
        const client = new ParaServer(
          Environment.BETA,
          process.env.NEXT_PUBLIC_PARA_API_KEY
        )
        await client.setUserShare(userShare!)
        return client
      })(),
      (async () => {
        if (!abi || !functionName || !args) return '0x'
        return encodeFunctionData({
          abi,
          functionName,
          args,
        })
      })(),
    ])

    const viemCapsuleAccount = createParaAccount(paraClient)
    const interaction = PublicClientInteractionsList({
      account: viemCapsuleAccount as any,
      chainId: chainId!,
    })
    const viemClient = createParaViemClient(paraClient, interaction)

    const [request, activeChain] = await Promise.all([
      viemClient.prepareTransactionRequest({
        account: viemCapsuleAccount,
        to: toAddress,
        value: value ? BigInt(value) : BigInt('0'),
        data,
        chain: interaction.chain,
      }),
      interaction.chain,
    ])

    const signatureResult = await viemClient.signTransaction({
      ...request,
      chain: request.chain as any,
    })

    return await viemClient.sendRawTransaction({
      serializedTransaction: signatureResult,
    })
  } catch (e: any) {
    console.log('SignTransactionWithPregenWalletServer Failed: ', e)
    throw new Error(e.details)
  }
}

export const createKernelClientWithPaymaster = async ({
  chainId,
}: {
  chainId: number
}) => {
  const ZERO_DEV_PROJECT_ID = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID
  const ZERO_DEV_BUNDLER_RPC = `https://rpc.zerodev.app/api/v2/bundler/${ZERO_DEV_PROJECT_ID}`
  const ZERO_DEV_PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${ZERO_DEV_PROJECT_ID}`
  const interaction = PublicClientInteractionsList({
    chainId: chainId,
  })

  const viemClient = createPublicClient({
    transport: interaction.transport,
    chain: interaction.chain,
  })
  const kernelClient = createKernelAccountClient({
    chain: interaction.chain,
    client: viemClient,
    bundlerTransport: http(ZERO_DEV_BUNDLER_RPC),
  })
  return kernelClient
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
    if (!userShare || !chainId || !toAddress) {
      throw new Error('User share, chain ID, and to address are required')
    }
    const [paraClient, data, ZERO_DEV_PROJECT_ID] = await Promise.all([
      (async () => {
        const client = new ParaServer(
          Environment.BETA,
          process.env.NEXT_PUBLIC_PARA_API_KEY
        )
        await client.setUserShare(userShare)
        return client
      })(),
      (async () => {
        if (!abi || !functionName || !args) return '0x'
        return encodeFunctionData({
          abi,
          functionName,
          args,
        })
      })(),
      process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID,
    ])

    const viemParaAccount = createParaAccount(paraClient)
    const interaction = PublicClientInteractionsList({
      account: viemParaAccount as any,
      chainId,
    })
    const viemClient = createParaViemClient(paraClient, interaction)

    viemClient.account!.signMessage = async ({
      message,
    }: {
      message: SignableMessage
    }): Promise<Hash> => {
      return customSignMessage(paraClient, message, walletId!)
    }

    const activeChain = interaction.chain
    const kernelVersion = KERNEL_V3_1
    const entryPoint = getEntryPoint('0.7')

    const ZERO_DEV_BUNDLER_RPC = `https://rpc.zerodev.app/api/v2/bundler/${ZERO_DEV_PROJECT_ID}`
    const ZERO_DEV_PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${ZERO_DEV_PROJECT_ID}`

    const publicClient = createPublicClient({
      transport: interaction.transport,
      chain: interaction.chain,
    })

    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer: viemClient.account as any,
      entryPoint,
      kernelVersion,
    })

    const kernalAccount = await createKernelAccount(viemClient, {
      plugins: {
        sudo: ecdsaValidator,
      },
      entryPoint,
      kernelVersion,
    })

    const kernelClient = createKernelAccountClient({
      account: kernalAccount,
      chain: activeChain,
      bundlerTransport: http(ZERO_DEV_BUNDLER_RPC),
      client: viemClient,
      paymaster: {
        getPaymasterData: (userOperation) => {
          const zerodevPaymaster = createZeroDevPaymasterClient({
            chain: activeChain,
            transport: http(ZERO_DEV_PAYMASTER_RPC),
          })
          return zerodevPaymaster.sponsorUserOperation({
            userOperation,
          })
        },
      },
      userOperation: {
        estimateFeesPerGas: async ({ bundlerClient }) => {
          return getUserOperationGasPrice(bundlerClient)
        },
      },
    })

    const encodedCalls = await kernelClient.account.encodeCalls([
      {
        to: toAddress,
        value: value ? BigInt(value) : BigInt('0'),
        data: data || '0x',
      },
    ])
    const txHash = await kernelClient.sendUserOperation({
      callData: encodedCalls,
    })
    await kernelClient.waitForUserOperationReceipt({
      hash: txHash,
    })
    return txHash
  } catch (e: any) {
    console.log(
      'PrepareAndSignSponsoredTransactionWithPregenWalletServer Failed: ',
      e
    )
    if (e instanceof Error) {
      throw new Error((e as any).details)
    } else {
      throw new Error('An unknown error occurred during sponsored transaction')
    }
  }
}

export const smartAccountAddress = async (
  address: `0x${string}`,
  chainId: number
) => {
  const interaction = PublicClientInteractionsList({
    chainId: chainId,
  })
  const publicClient = createPublicClient({
    transport: http(),
    chain: interaction.chain,
  })
  const kernelVersion = KERNEL_V3_1
  const entryPoint = getEntryPoint('0.7')
  const smartAccountAddress = await getKernelAddressFromECDSA({
    publicClient: publicClient as any,
    eoaAddress: address,
    kernelVersion: kernelVersion,
    entryPoint: entryPoint,
    index: BigInt(0),
  })
  return smartAccountAddress
}

async function customSignMessage(
  para: ParaServer,
  message: SignableMessage,
  walletId: string
): Promise<Hash> {
  // Hash the message according to Ethereum's signed message specification.
  const hashedMessage = hashMessage(message)
  const res = await para.signMessage({
    walletId: walletId,
    messageBase64: hexStringToBase64(hashedMessage),
  })
  let signature = (res as SuccessfulSignatureRes).signature

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
