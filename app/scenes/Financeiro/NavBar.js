import { FontAwesome5, Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import Constants from 'expo-constants'
import React, { useContext } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { FinanceiroContext } from '../../components/navigation/contexts'
import { LabelPrimary, NavBarView, useDefaultStyleSheet } from '../../components/style'

const NavBarFinanceiro = () => {
  const { textPrimaryColor } = useDefaultStyleSheet()
  const { toggleFilterOpen } = useContext(FinanceiroContext)
  const navigation = useNavigation()

  const toggleDrawer = () => {
    return navigation.toggleDrawer()
  }

  return (
        <NavBarView style={styles.nav}>
            <View style={styles.navDivider}>
                <TouchableOpacity onPress={toggleDrawer}>
                    <Ionicons name="menu" color={textPrimaryColor} size={45}></Ionicons>
                </TouchableOpacity>
                <LabelPrimary style={styles.text}>FINANCEIRO</LabelPrimary>
            </View>
            <TouchableOpacity style={styles.button} onPress={toggleFilterOpen}>
                <FontAwesome5 name="filter" size={22} color={textPrimaryColor} />
            </TouchableOpacity>
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
  },
  button: {
    marginHorizontal: 10
  }
})

export default NavBarFinanceiro
