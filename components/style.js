import { Platform, StyleSheet, useColorScheme } from 'react-native'
import styled from 'styled-components/native'

export function useDefaultStyleSheet () {
  const scheme = useColorScheme()
  const dark = scheme === 'dark'

  return {
    defaultStyle: StyleSheet.create({
      buttonText: {
        color: 'white'
      }
    })
  }
}

export const FlatList6 = styled.FlatList`
  background-color: 'white';
`
