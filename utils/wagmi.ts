import { http, createConfig } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'
import { coinbaseWallet, metaMask } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: { [baseSepolia.id]: http() },
  connectors: [
    farcasterMiniApp(),
    // add other wallet connectors like metamask or coinbase wallet if desired
    coinbaseWallet(),
    metaMask(),
  ],
})