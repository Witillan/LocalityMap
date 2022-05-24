import { FontAwesome5, Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import Constants from 'expo-constants'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import ModelLoading from '../../components/Modal/ModalLoading'
import { CompraContext, SyncContext } from '../../components/navigation/contexts'
import { LabelPrimary, NavBarView, useDefaultStyleSheet } from '../../components/style'

const NavBarCompras = () => {
  const { sync, loading } = React.useContext(SyncContext)
  const { toggleFilterOpen } = React.useContext(CompraContext)
  const { textPrimaryColor } = useDefaultStyleSheet()
  const navigation = useNavigation()

  return <NavBarView style={styles.nav}>
        <View style={styles.navDivider}>
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
                <Ionicons name="menu" color={textPrimaryColor} size={45}></Ionicons>
            </TouchableOpacity>
            <LabelPrimary style={styles.text}>COMPRAS</LabelPrimary>
        </View>
        <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity disabled={loading} style={styles.buttonSync} onPress={toggleFilterOpen}>
                <FontAwesome5 name="filter" size={22} color={textPrimaryColor} />
            </TouchableOpacity>
            <TouchableOpacity disabled={loading} style={styles.buttonSync} onPress={sync}>
                <FontAwesome5 name="sync" size={22} color={textPrimaryColor} />
            </TouchableOpacity>
        </View>
        <ModelLoading />
    </NavBarView>
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

export default NavBarCompras
