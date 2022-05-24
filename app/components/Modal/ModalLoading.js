import AsyncStorage from '@react-native-async-storage/async-storage'
import React from 'react'
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native'
import { SyncContext } from '../navigation/contexts'
import { Label, ListItem1, useDefaultStyleSheet } from '../style'

const ModalLoading = () => {
  const { textPrimaryColor, backgroundColorFundoModal } = useDefaultStyleSheet()
  const { loading, message } = React.useContext(SyncContext)
  return (
        <Modal animationType={'none'} transparent={true} visible={loading}>
            <View style={[styles.modal, { backgroundColor: backgroundColorFundoModal }]}>
                <ListItem1 style={styles.loadingModal}>
                    <ActivityIndicator style={{ padding: 0, margin: 0 }} color={textPrimaryColor} size='large' />
                    <Label style={{ fontSize: 16 }}>{message}</Label>
                </ListItem1>
            </View>
        </Modal>
  )
}
export const ModalBasic = ({ loading, message }) => {
  const { textPrimaryColor, backgroundColorFundoModal } = useDefaultStyleSheet()
  return (
        <Modal animationType={'none'} transparent={true} visible={loading}>
            <View style={[styles.modal, { backgroundColor: backgroundColorFundoModal }]}>
                <ListItem1 style={styles.loadingModal}>
                    <ActivityIndicator style={{ padding: 0, margin: 0 }} color={textPrimaryColor} size='large' />
                    <Label style={{ fontSize: 16 }}>{message}</Label>
                </ListItem1>
            </View>
        </Modal>
  )
}

export const AsyncStorageSync = ({ sync }) => {
  AsyncStorage.getItem('Sincronizar').then(async r => {
    if (r === 'true') {
      sync()
      await AsyncStorage.removeItem('Sincronizar')
    }
  })
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
  loadingModal: {
    height: 162,
    width: 332,
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20
  }
})

export default ModalLoading
