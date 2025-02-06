import { PrepareRlpEncodedTx } from '@/components/pc/drives/Interactions/Prepare'
import { TESTABI, testaddress } from '@/components/pc/drives/Interactions/ABI'
import { Button2 } from '@/components/pc/drives/UI/UI_Components.v1'
import React from 'react'
import { useChainId } from 'wagmi'
import { usePregenSession } from '@/components/pc/drives/Storage/PregenSession'
import axios from 'axios'
import { PrepareAndSignTransactionWithPregenWalletServerProps } from '@/pages/api/create/pregentransaction'

const TetrisGame = () => {
  const chainId = useChainId()
  const { pregenWalletId, pregenEncryptedKeyShare } = usePregenSession()
  return (
    <div>
      TetrisGame
      <Button2
        onClick={async () => {
          console.log('click')

          const result = await axios.post('api/create/pregentransaction', {
            abi: TESTABI,
            toAddress: testaddress,
            functionName: 'callData',
            args: [2],
            chainId: chainId,
            userShare: pregenEncryptedKeyShare!,
            walletId: pregenWalletId!,
          } satisfies PrepareAndSignTransactionWithPregenWalletServerProps)
          console.log(result)
        }}
      >
        Test on chain
      </Button2>
    </div>
  )
}

export default TetrisGame
