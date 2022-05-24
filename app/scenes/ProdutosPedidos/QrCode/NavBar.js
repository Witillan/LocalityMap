import { FontAwesome5 } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import Constants from 'expo-constants'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useDefaultStyleSheet } from '../../../components/style'

const NavBarProdutos = () => {
  const navigation = useNavigation()
  const { defaultStyle, textPrimaryColor } = useDefaultStyleSheet()

  return (
        <View style={[styles.nav, defaultStyle.nav]}>
            <View style={styles.navDivider}>
                <TouchableOpacity onPress={navigation.goBack}>
                    <FontAwesome5 name="arrow-left" color={textPrimaryColor} size={35}></FontAwesome5>
                </TouchableOpacity>
                <Text style={[styles.text, defaultStyle.textPrimary]}>LER QR CODE</Text>
            </View>
        </View >
  )
}

const styles = StyleSheet.create({
  nav: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: Constants.statusBarHeight,
    padding: 5,
    justifyContent: 'space-between'
  },
  navDivider: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  text: {
    fontSize: 20,
    paddingLeft: 15,
    paddingTop: 7,
    paddingBottom: 7.34,
    color: '#0A7AC3'
  },
  buttonSync: {
    marginHorizontal: 10
  }
})

export default NavBarProdutos
