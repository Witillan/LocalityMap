import { FontAwesome5 } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import Constants from 'expo-constants'
import React, { useContext } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'

import { CompraContext } from '../../../components/navigation/contexts'
import { LabelPrimary, NavBarView, useDefaultStyleSheet } from '../../../components/style'

const NavBarNewCompra = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { selecionados } = useContext(CompraContext)
  const { id } = route?.params || {}
  const { textPrimaryColor } = useDefaultStyleSheet()

  return (
        <NavBarView style={styles.nav}>
            <View style={styles.navDivider}>
                <TouchableOpacity onPress={() => {
                  if (id) {
                    navigation.navigate('Compras')
                  } else if (!selecionados.length) {
                    navigation.navigate('Compras')
                  } else {
                    Alert.alert('Confirmar', 'Você poderá perder sua venda. Deseja mesmo voltar?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Ok',
                          onPress: () =>
                            navigation.navigate('Compras')
                        }
                      ]
                    )
                  }
                }}>
                    <FontAwesome5 name="arrow-left" color={textPrimaryColor} size={35}></FontAwesome5>
                </TouchableOpacity>
                <LabelPrimary style={styles.text}>COMPRA</LabelPrimary>
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
    paddingLeft: 17,
    paddingTop: 9,
    paddingBottom: 8.34
  }
})

export default NavBarNewCompra
