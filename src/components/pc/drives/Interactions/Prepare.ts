'use server'
import { simulateContract } from '@wagmi/core'
import { http, createConfig } from '@wagmi/core'
import { mainnet, sepolia } from '@wagmi/core/chains'
import { rlp } from 'ethereumjs-util'
import { encodeFunctionData } from 'viem'

export async function getConfig() {
  return createConfig({
    chains: [mainnet, sepolia],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  })
}

export async function SimulateWagmiTransaction(
  abi: any,
  address: string,
  functionName: string,
  args: any[],
  chainId: number
) {
  const config = await getConfig()
  const result = await simulateContract(config, {
    abi,
    address: address as `0x${string}`,
    functionName,
    args,
    chainId: chainId as 1 | 11155111,
  })
  return result
}

/**
 * Prepares and RLP encodes a contract transaction
 */
export async function PrepareRlpEncodedTx(
  abi: any[],
  address: `0x${string}`,
  functionName: string,
  args: any[],
  chainId: number,
  value?: string,
  gasPrice?: string,
  gasLimit?: string
) {
  try {
    // Encode function data
    const data = encodeFunctionData({
      abi,
      functionName,
      args,
    })

    // Prepare transaction data
    const txData = {
      nonce: '0x00',
      gasPrice: gasPrice || '0x00',
      gasLimit: gasLimit || '0x00',
      to: address,
      value: value || '0x00',
      data,
      chainId,
    }

    // RLP encode the transaction
    const rlpEncoded = rlp.encode(Object.values(txData))

    // Convert to Base64
    return Buffer.from(rlpEncoded).toString('base64')
  } catch (e) {
    console.log('PrepareRlpEncodedTx Failed: ', e)
    return e
  }
}
