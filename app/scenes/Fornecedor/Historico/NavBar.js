import { FontAwesome5 } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import Constants from 'expo-constants'
import React, { useContext } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { FornecedorContext } from '../../../components/navigation/contexts'
import { LabelPrimary, NavBarView, useDefaultStyleSheet } from '../../../components/style'

const NavBarHistoricoFornecedor = () => {
  const navigation = useNavigation()
  const { textPrimaryColor } = useDefaultStyleSheet()
  const { toggleFilterOpen } = useContext(FornecedorContext)

  return (
        <NavBarView style={styles.nav}>
            <View style={styles.navDivider}>
                <TouchableOpacity onPress={navigation.goBack}>
                    <FontAwesome5 name="arrow-left" color={textPrimaryColor} size={35}></FontAwesome5>
                </TouchableOpacity>
                <LabelPrimary style={styles.text}>HISTÓRICO</LabelPrimary>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={styles.button} onPress={toggleFilterOpen}>
                    <FontAwesome5 name="filter" size={22} color={textPrimaryColor} />
                </TouchableOpacity>
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
  },
  button: {
    marginHorizontal: 10
  }
})

export default NavBarHistoricoFornecedor
