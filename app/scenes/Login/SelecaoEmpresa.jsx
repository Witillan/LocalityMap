import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useState } from 'react'
import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import TouchableOpacityButtonSuccess from '../../components/Buttons/TouchableOpacityButtonSuccess'
import ModalAmbiente from '../../components/Modal/ModalAmbiente'
import { ModalBasic } from '../../components/Modal/ModalLoading'
import { Container1, Input, Label, LabelValidation, ScrollView1, useDefaultStyleSheet } from '../../components/style'

export default ({ onSubmit, loading }) => {
  // CNPJ da empresa vindo do form de empresa
  const [empresaCnpj, setEmpresaCnpj] = useState('')
  const [loadingModal, setLoadingModal] = useState(false)
  const [ambiente, setAmbiente] = useState('')

  const { defaultStyle, placeholderTextColor, textPrimaryColor } = useDefaultStyleSheet()

  useEffect(() => {
    const buscarAmbiente = async () => {
      setAmbiente(await AsyncStorage.getItem('Homologacao'))
    }
    buscarAmbiente()
  }, [loadingModal])

  return (
    <Container1 style={styles.inner}>
      <ScrollView1 contentContainerStyle={[styles.inner, { flex: 1 }]}>
        <View>
          <TouchableOpacity
            style={[styles.settings, defaultStyle.background1]}
            onPress={() =>
              Alert.alert('Escolher ambiente', 'Você deseja mesmo trocar de ambiente?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Sim', onPress: () => setLoadingModal(true) }])
            }
          >
            <Ionicons name="settings-sharp" size={24} color={textPrimaryColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.divImage}>
          <Image style={styles.image} source={require('../../assets/logo.png')} />
          {ambiente === 'true' && <LabelValidation style={[styles.margin10]}>{'Você está no ambiente de homologação!'}</LabelValidation>}
        </View>
        <Label style={styles.marginBottom} >Digite o CPF/CNPJ da empresa (Sem pontos)</Label>
        <Input keyboardType="number-pad" placeholderTextColor={placeholderTextColor} placeholder='Digite CPF/CNPJ aqui' onChangeText={setEmpresaCnpj} value={empresaCnpj} />
        <View style={styles.button}>
          <TouchableOpacityButtonSuccess
            disabled={loading}
            onSubmit={() => onSubmit(empresaCnpj)}
            label="REGISTRAR"
          />
        </View>
        <ModalBasic loading={loading} message="Carregando..." />
        <ModalAmbiente
          visible={loadingModal}
          setVisible={setLoadingModal}
        />
      </ScrollView1>
    </Container1>
  )
}

const styles = StyleSheet.create({
  marginBottom: {
    marginBottom: 15
  },
  inner: {
    paddingTop: 0,
    paddingBottom: 24,
    paddingLeft: 24,
    paddingRight: 24,
    justifyContent: 'center'
  },
  image: {
    width: 180,
    height: 180,
    marginTop: 50
  },
  divImage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    marginBottom: 50,
    marginVertical: 10
  },
  settings: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  margin10: {
    marginTop: 5,
    marginBottom: 10
  }
})
