'use client'
import PcDesktop from '@/components/pc'
import { NotificationContainer } from '@/components/pc/drives/Extensions/ToastNotifs'
import Web3Wrapper from '@/components/pc/drives/Extensions/Web3Wrapper'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
export default function Home() {
  return (
    <div>
      <NuqsAdapter>
        <NotificationContainer />
        <Web3Wrapper />
      </NuqsAdapter>
    </div>
  )
}
