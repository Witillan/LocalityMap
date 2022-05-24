import { Entypo, Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { androidId, getIosIdForVendorAsync } from 'expo-application'
import React, { useCallback, useContext, useState } from 'react'
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import TouchableOpacityButtonPrimary from '../../components/Buttons/TouchableOpacityButtonPrimary'
import TouchableOpacityButtonSuccess from '../../components/Buttons/TouchableOpacityButtonSuccess'
import { AuthContext } from '../../components/navigation/contexts'
import { Label18, Label18Bold, useDefaultStyleSheet } from '../../components/style'
import * as Clipboard from 'expo-clipboard'

const LiberacaoPendente = ({ empresaId, trocarEmpresa }) => {
  const { verificarLiberacaoDispositivo } = useContext(AuthContext)
  const { defaultStyle, textWarningColor } = useDefaultStyleSheet()
  const [loading, setLoading] = useState(false)
  const [uniqueId, setUniqueId] = useState('')

  useFocusEffect(useCallback(() => {
    if (Platform.OS === 'android') {
      setUniqueId(androidId)
    } else {
      getIosIdForVendorAsync().then(id => setUniqueId(id))
    }
  }, []))

  const verificar = () => {
    setLoading(true)
    verificarLiberacaoDispositivo(empresaId)
      .then(r => {
        if (!r) { Alert.alert('Validar Dispositivo', 'Seu dispositivo ainda não foi validado pelo administrador') }
      })
      .finally(() => setLoading(false))
  }

  const copiar = useCallback(() => {
    Clipboard.setString(uniqueId)
    alert('Copiado com sucesso!')
  }, [uniqueId])

  return <View style={[styles.container, defaultStyle.background1]}>
    <Entypo name="warning" color={textWarningColor} size={100} />
    <Label18 style={styles.mt10}>Seu dispositivo aguarda liberação online para poder acessar o app</Label18>
    <Label18 style={styles.mt10}>ID de dispositivo:</Label18>
    <View style={{ justifyContent: 'space-around', flexDirection: 'row', alignItems: 'center' }}>
      <Label18Bold style={styles.mt10}>{uniqueId}</Label18Bold>
      <TouchableOpacity style={{ marginLeft: 15 }} onPress={copiar}>
        <Ionicons size={30} color="gray" name="copy" />
      </TouchableOpacity>
    </View>
    <TouchableOpacityButtonSuccess
      disabled={loading}
      onSubmit={verificar}
      label="Verificar liberação"
      style={styles.mt10}
    />
    <TouchableOpacityButtonPrimary
      disabled={false}
      onSubmit={trocarEmpresa}
      label="Trocar empresa"
      style={styles.mt10}
    />
  </View>
}

export default LiberacaoPendente

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50
  },
  mt10: {
    marginTop: 10
  }
})
