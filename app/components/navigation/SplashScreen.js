import Constants from 'expo-constants'
import React from 'react'
import { ActivityIndicator, StyleSheet } from 'react-native'

import { ListItem1, Label, useDefaultStyleSheet } from '../style'

export function SplashScreen () {
  const { textPrimaryColor } = useDefaultStyleSheet()
  return <ListItem1 style={styles.container}>
    <ActivityIndicator style={{ padding: 0, margin: 0 }} color={textPrimaryColor} size='large' />
    <Label style={styles.title}>Carregando...</Label>
  </ListItem1>
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 30
  }
})
