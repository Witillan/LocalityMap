import NetInfo from '@react-native-community/netinfo'
import { getNetworkStateAsync } from 'expo-network'
import { useEffect, useState } from 'react'

export const useNetworkStatus = () => {
  const [value, setValue] = useState({})

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (JSON.stringify(state) === JSON.stringify(value)) {
        return
      }

      setValue(state)
    })

    return () => {
      unsubscribe()
    }
  }, [value])

  return value
}

export const checkConnection = async () => {
  return await (await getNetworkStateAsync()).isConnected
}
