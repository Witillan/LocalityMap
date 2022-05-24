import { FontAwesome5 } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import Constants from 'expo-constants'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { LabelPrimary, NavBarView, useDefaultStyleSheet } from '../../../components/style'

const NavBarNewFornecedor = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { textPrimaryColor } = useDefaultStyleSheet()
  const { tempId } = route?.params || {}
  const readOnly = !!tempId

  return (
        <NavBarView style={styles.nav}>
            <View style={styles.navDivider}>
                <TouchableOpacity onPress={navigation.goBack}>
                    <FontAwesome5 name="arrow-left" color={textPrimaryColor} size={35}></FontAwesome5>
                </TouchableOpacity>
                <LabelPrimary style={styles.text}>{readOnly ? 'EDITAR FORNECEDOR' : 'NOVO FORNECEDOR'}</LabelPrimary>
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
    padding: 8,
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

export default NavBarNewFornecedor
