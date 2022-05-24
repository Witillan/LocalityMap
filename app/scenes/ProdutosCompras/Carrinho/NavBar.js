import { FontAwesome5 } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import Constants from 'expo-constants'
import React, { useContext } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'

import { CompraContext } from '../../../components/navigation/contexts'
import { LabelPrimary, NavBarView, useDefaultStyleSheet } from '../../../components/style'

const NavBarCarrinho = () => {
  const navigation = useNavigation()
  const { textPrimaryColor } = useDefaultStyleSheet()
  const { setSelecionados } = useContext(CompraContext)

  return (
        <NavBarView style={styles.nav}>
            <View style={styles.navDivider}>
                <TouchableOpacity onPress={() => {
                  Alert.alert('Confirmar', 'Você poderá perder todos os seus itens. Deseja mesmo voltar?',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Ok',
                        onPress: () => {
                          setSelecionados([])
                          navigation.goBack()
                        }
                      }
                    ]
                  )
                }}>
                    <FontAwesome5 name="arrow-left" color={textPrimaryColor} size={35}></FontAwesome5>
                </TouchableOpacity>
                <LabelPrimary style={styles.text}>CARRINHO</LabelPrimary>
            </View>
            <View>
                <TouchableOpacity style={styles.buttonSync} onPress={() => navigation.navigate('QrCodeReader')}>
                    <FontAwesome5 name="qrcode" size={22} color={textPrimaryColor} />
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
  buttonSync: {
    marginHorizontal: 10
  }
})

export default NavBarCarrinho
