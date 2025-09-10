import { useMiniKit } from '@coinbase/onchainkit/minikit'
import { useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'
import { useAccount, useConnect } from 'wagmi'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

export const InitializeMiniKit = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { setFrameReady, isFrameReady } = useMiniKit()
  const { connect } = useConnect()
  const { address } = useAccount()

  console.log('Account Connected!', address)

  useEffect(() => {
    if (!isFrameReady)
      setFrameReady({ disableNativeGestures: true }).then(async () => {
        console.log('App Initialized!')
        await sdk.actions.addMiniApp()
        connect({ connector: farcasterMiniApp() })
      })
  }, [setFrameReady, isFrameReady, connect])

  return <>{children}</>
}