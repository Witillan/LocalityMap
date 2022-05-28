import { Platform, StyleSheet, useColorScheme } from 'react-native'
import styled from 'styled-components/native'

export function useDefaultStyleSheet() {
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

export const TextFont = styled.Text`
  font-family: Lobster-Regular;
`
