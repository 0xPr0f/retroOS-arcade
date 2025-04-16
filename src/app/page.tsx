'use client'
import Web3Wrapper from '@/components/pc/drives/Extensions/Web3Wrapper'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
export default function Home() {
  return (
    <div>
      <NuqsAdapter>
        <Web3Wrapper />
      </NuqsAdapter>
    </div>
  )
}
