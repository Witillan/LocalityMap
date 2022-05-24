import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import Constants from 'expo-constants'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { NavBarView, LabelPrimary, useDefaultStyleSheet } from '../../components/style'

const NavBarLimparDados = () => {
  const navigation = useNavigation()
  const { textPrimaryColor } = useDefaultStyleSheet()

  const toggleDrawer = () => {
    return navigation.toggleDrawer()
  }

  return (
        <NavBarView style={styles.nav}>
            <View style={styles.navDivider}>
                <TouchableOpacity onPress={toggleDrawer}>
                    <Ionicons name="menu" color={textPrimaryColor} size={45}></Ionicons>
                </TouchableOpacity>
                <LabelPrimary style={styles.text}>LIMPAR DADOS</LabelPrimary>
            </View>
        </NavBarView>
  )
}

const styles = StyleSheet.create({
  nav: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Constants.statusBarHeight,
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
    paddingBottom: 7.34
  }
})

export default NavBarLimparDados
