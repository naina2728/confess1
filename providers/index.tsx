'use client'
import { ReactNode } from 'react'
import { MiniKitProvider } from '@coinbase/onchainkit/minikit'
import { baseSepolia } from 'wagmi/chains'
import { InitializeMiniKit } from './InitializeMiniKit'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '@/utils/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <MiniKitProvider
      projectId={process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_ID}
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={baseSepolia}
      config={{
        appearance: {
          name: 'Bitmor',
          logo: 'https://dca.bitmor.xyz/mini-app/logo.png',
        },
      }}
    >
      <InitializeMiniKit>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
              {children}
          </QueryClientProvider>
        </WagmiProvider>
      </InitializeMiniKit>
    </MiniKitProvider>
  )
}