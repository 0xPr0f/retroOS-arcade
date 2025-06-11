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
  alchemy,
  mainnet,
  sepolia,
  baseSepolia,
  monadTestnet,
} from '@account-kit/infra'
import { createModularAccountV2Client } from '@account-kit/smart-contracts'

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

import {} from 'viem/chains'
import { KERNEL_V3_1, KERNEL_V3_2, getEntryPoint } from '@zerodev/sdk/constants'
import { createKernelAccountClient } from '@zerodev/sdk'
import { createKernelAccount } from '@zerodev/sdk'
import {
  createZeroDevPaymasterClient,
  getUserOperationGasPrice,
} from '@zerodev/sdk'
import {
  createEcdsaKernelMigrationAccount,
  getKernelAddressFromECDSA,
  signerToEcdsaValidator,
} from '@zerodev/ecdsa-validator'
import { BatchUserOperationCallData, WalletClientSigner } from '@aa-sdk/core'
import type { Para } from '@getpara/server-sdk'
import type {
  AuthorizationRequest,
  LocalAccount,
  SignAuthorizationReturnType,
} from 'viem'
import { hashAuthorization } from 'viem/utils'

const SIGNATURE_LENGTH = 130
const V_OFFSET_FOR_ETHEREUM = 27

const PublicClientInteractionsList = ({
  chainId,
  account,
}: {
  chainId: number
  account?: any
}) => {
  const infuraKey = process.env.NEXT_PUBLIC_INFURA_KEY
  const blastAPIKey = process.env.NEXT_PUBLIC_BLAST_API_KEY
  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

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
    case 10143:
      return {
        account: account,
        chain: monadTestnet,
        transport: http(`https://monad-testnet.g.alchemy.com/v2/${alchemyKey}`),
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
        await client.importSession(userShare!)
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

    const testclient = createPublicClient({
      chain: interaction.chain,
      transport: interaction.transport,
    })
    const onChainBal = await testclient.getBalance({
      address: viemCapsuleAccount.address as `0x${string}`,
      blockTag: 'latest',
    })

    console.log(`Sender balance: ${Number(onChainBal) / 1e18} MON`, onChainBal)

    const gasEstination = await testclient.estimateGas({
      account: viemCapsuleAccount.address as `0x${string}`,
      to: toAddress,
      value: value ? BigInt(value) : BigInt('0'),
      data: data,
      blockTag: 'latest',
    })

    console.log('Gas Estimation', BigInt(gasEstination))

    const [request, activeChain] = await Promise.all([
      viemClient.prepareTransactionRequest({
        account: viemCapsuleAccount,
        to: toAddress,
        value: value ? BigInt(value) : BigInt('0'),
        data,
        chain: interaction.chain,
        gas: BigInt(gasEstination),
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
        await client.importSession(userShare)
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
    const viemClient = createParaViemClient(paraClient, interaction) as any

    viemClient.account!.signMessage = async ({
      message,
    }: {
      message: SignableMessage
    }): Promise<Hash> => {
      return customSignMessageN(paraClient, message)
    }

    const activeChain = interaction.chain
    // const kernelVersion = KERNEL_V3_1
    const originalKernelVersion = KERNEL_V3_1
    const migrationVersion = KERNEL_V3_2

    const entryPoint = getEntryPoint('0.7')

    const ZERO_DEV_BUNDLER_RPC = `https://rpc.zerodev.app/api/v3/${ZERO_DEV_PROJECT_ID}/chain/${activeChain.id.toString()}`
    const ZERO_DEV_PAYMASTER_RPC = `https://rpc.zerodev.app/api/v3/${ZERO_DEV_PROJECT_ID}/chain/${activeChain.id.toString()}`

    const publicClient = createPublicClient({
      transport: interaction.transport,
      chain: interaction.chain,
    })

    const kernalAccount = await createEcdsaKernelMigrationAccount(
      publicClient,
      {
        entryPoint,
        signer: viemClient.account as any,

        migrationVersion: {
          from: originalKernelVersion,
          to: migrationVersion,
        },
      }
    )

    /* const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
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
*/

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
    console.log('Pass Here 1')
    const txHash = await kernelClient.sendUserOperation({
      callData: encodedCalls,
    })
    console.log('Pass Here 2')
    /* await kernelClient.waitForUserOperationReceipt({
      hash: txHash,
    }) */
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

export const AlchemyPrepareAndSignSponsoredTransactionWith7702 = async ({
  session,
  walletId,
  abi,
  toAddress,
  functionName,
  args,
  chainId,
  value,
}: {
  session?: string
  walletId?: string
  abi?: any[]
  toAddress?: `0x${string}`
  functionName?: string
  args?: any[]
  chainId?: number
  value?: string
}) => {
  /* const paraApiKey = process.env.PARA_API_KEY
  const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
  const alchemyGasPolicyId = process.env.NEXT_PUBLIC_ALCHEMY_GAS_POLICY_ID
  const interaction = PublicClientInteractionsList({
    chainId: chainId!,
  })
  const rpcUrl = interaction.chain.rpcUrls.alchemy.http[0]
  const env = (process.env.PARA_ENVIRONMENT as Environment) || Environment.BETA

  if (!paraApiKey || !alchemyApiKey || !alchemyGasPolicyId || !rpcUrl) {
    console.log({
      error: 'Missing environment variables',
      message:
        'Missing required environment variables (PARA_API_KEY, ALCHEMY_API_KEY, ALCHEMY_GAS_POLICY_ID, ALCHEMY_ARBITRUM_SEPOLIA_RPC).',
    })
    return
  }
  console.log('1. Initializing Para Server...')
  const para = new ParaServer(env, paraApiKey)

  console.log('2. Importing session...')
  await para.importSession(session!)
  console.log('   Session imported successfully')

  console.log('3. Creating Para Viem Account...')
  const viemParaAccount: LocalAccount = createParaAccount(para)
  console.log('   Account address:', viemParaAccount.address)

  viemParaAccount.signMessage = async ({ message }) =>
    customSignMessageN(para, message)
  viemParaAccount.signAuthorization = async (authorization) => {
    console.log('   Signing authorization:', authorization)
    return customSignAuthorization(para, authorization)
  }
  const viemClient = createParaViemClient(para, {
    account: viemParaAccount,
    chain: interaction.chain,
    transport: http(rpcUrl),
  })

  const walletClientSigner = new WalletClientSigner(viemClient, 'para')
  console.log('4')

  const alchemyClient = await createModularAccountV2Client({
    mode: '7702',
    transport: alchemy({
      apiKey: alchemyApiKey,
    }),
    chain: interaction.chain,
    signer: walletClientSigner,
    policyId: alchemyGasPolicyId,
  })
  console.log('   Alchemy client created')
  console.log('   Account address:', alchemyClient.account.address)
  console.log(
    '   Is same as EOA?',
    alchemyClient.account.address === viemParaAccount.address,
    viemParaAccount.address
  )

  console.log('5.')
  const data = (() => {
    if (!abi || !functionName || !args) return '0x'
    return encodeFunctionData({
      abi,
      functionName,
      args,
    })
  })()

  const userOperations: BatchUserOperationCallData = {
    target: toAddress,
    data: data,
  }
  console.log('6.', data)
  console.log(alchemyClient)
  const userOperationResult = await alchemyClient.sendUserOperation({
    uo: userOperations,
    value: value ? BigInt(value) : BigInt('0'),
    data: data,
  })

  console.log('7.')
  const txHash = await alchemyClient.waitForUserOperationTransaction(
    userOperationResult
  )
  console.log('   Transaction Hash:', txHash) */
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

export const UpdateAndClaimPregenWallet = async ({
  paraClientSession,
  pregenIdentifier,
  walletId,
  userShare,
}: {
  paraClientSession: string
  pregenIdentifier: string
  walletId: string
  userShare?: string
}) => {
  const paraClient = new ParaServer(
    Environment.BETA,
    process.env.NEXT_PUBLIC_PARA_API_KEY
  )
  await paraClient.importSession(paraClientSession)

  const isActive = await paraClient.isSessionActive()

  console.log('isActive', isActive)

  if (userShare) {
    await paraClient.setUserShare(userShare)
  }
  // It can only be email
  /*
  await paraClient.updatePregenWalletIdentifier({
    walletId: walletId,
    newPregenIdentifier: pregenIdentifier,
    newPregenIdentifierType: 'EMAIL',
  })

  const recoverySecret = await paraClient.claimPregenWallets({
    pregenIdentifier: pregenIdentifier,
    pregenIdentifierType: 'EMAIL',
  })

  console.log(recoverySecret)
  return recoverySecret
*/
  return ''
}

function parseSignature(signature: string): {
  r: string
  s: string
  v: number
} {
  const cleanSig = signature.startsWith('0x') ? signature.slice(2) : signature

  if (cleanSig.length !== SIGNATURE_LENGTH) {
    throw new Error(
      `Invalid signature length: expected ${SIGNATURE_LENGTH} hex chars, got ${cleanSig.length}`
    )
  }

  const r = cleanSig.slice(0, 64)
  const s = cleanSig.slice(64, 128)
  const vHex = cleanSig.slice(128, 130)
  const v = parseInt(vHex, 16)

  if (isNaN(v)) {
    throw new Error(`Invalid v value in signature: ${vHex}`)
  }

  return { r, s, v }
}

async function signWithPara(
  para: Para,
  hash: Hash,
  adjustV: boolean = true
): Promise<Hash> {
  const wallet = para.getWalletsByType('EVM')[0]
  if (!wallet) {
    throw new Error('Para wallet not available for signing')
  }

  const messagePayload = hash.startsWith('0x') ? hash.substring(2) : hash
  const messageBase64 = hexStringToBase64(messagePayload)

  const response = await para.signMessage({
    walletId: wallet.id,
    messageBase64,
  })

  if (!('signature' in response)) {
    throw new Error(`Signature failed: ${JSON.stringify(response)}`)
  }

  let signature = (response as SuccessfulSignatureRes).signature

  const { v } = parseSignature(signature)

  if (adjustV && v < 27) {
    const adjustedV = (v + V_OFFSET_FOR_ETHEREUM).toString(16).padStart(2, '0')
    signature = signature.slice(0, -2) + adjustedV
  }

  return `0x${signature}`
}

export async function customSignMessageN(
  para: Para,
  message: SignableMessage
): Promise<Hash> {
  const hashedMessage = hashMessage(message)
  return signWithPara(para, hashedMessage, true)
}

export async function customSignAuthorization(
  para: Para,
  authorization: AuthorizationRequest
): Promise<SignAuthorizationReturnType> {
  const address = (authorization.address ||
    authorization.contractAddress) as `0x${string}`
  if (!address) {
    throw new Error('Authorization must include address or contractAddress')
  }

  const authorizationHash = hashAuthorization({
    address,
    chainId: authorization.chainId,
    nonce: authorization.nonce,
  })

  const fullSignature = await signWithPara(para, authorizationHash, false)

  const { r, s, v } = parseSignature(fullSignature)

  if (v !== 0 && v !== 1) {
    throw new Error(`Invalid v value for EIP-7702: ${v}. Expected 0 or 1`)
  }

  return {
    address,
    chainId: Number(authorization.chainId),
    nonce: Number(authorization.nonce),
    r: `0x${r}`,
    s: `0x${s}`,
    yParity: v as 0 | 1,
    v: BigInt(v),
  }
}
