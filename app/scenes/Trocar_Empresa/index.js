import { Picker } from '@react-native-picker/picker'
import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet } from 'react-native'
import TouchableOpacityButtonPrimary from '../../components/Buttons/TouchableOpacityButtonPrimary'
import { ModalBasic } from '../../components/Modal/ModalLoading'
import { AuthContext } from '../../components/navigation/contexts'
import { Container1, ContainerPickerView, Label, useDefaultStyleSheet } from '../../components/style'
import { checkConnection } from '../../hooks/useNetworkStatus'
import { getApiUrl, getRequestOptions } from '../../util/fetch'

const TrocarEmpresa = () => {
  const navigation = useNavigation()
  const { defaultStyle, placeholderTextColor, pickerItemColor } = useDefaultStyleSheet()
  const { subEmpresaId, userInfo, changeSubEmpresaId } = React.useContext(AuthContext)

  const [subEmpresas, setSubEmpresas] = useState([])
  const [subEmpresa, setSubEmpresaId] = useState(subEmpresaId || '')

  const [loading, setLoading] = useState(false)

  const trocarSubEmpresa = async () => {
    try {
      if (await checkConnection()) {
        setLoading(true)
        await changeSubEmpresaId(subEmpresa)

        Alert.alert('Sucesso', 'A troca de empresa foi realizada com sucesso!', [{ text: 'OK', onPress: () => navigation.navigate('Pedidos') }])
      } else {
        Alert.alert('Offline', 'Não será possível trocar de empresa, pois você está offline')
      }
    } catch (e) {
      Alert.alert('Erro', e.message)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    setLoading(true)
    getRequestOptions('GET', false)
      .then(async (options) => fetch(`${await getApiUrl()}/Auth/ObterSubEmpresas/${userInfo.id}`, options)
        .then(r => {
          if (!r.ok) {
            throw new Error(`Ocorreu um erro ${r.status} ao obter as empresas. Entre em contato com o suporte Alpha Software.`)
          }
          return r
        })
        .then(r => r.json())
        .then(r => {
          setSubEmpresas(r)
        })
        .catch(err => {
          Alert.alert('Erro', err.message)
          setLoading(false)
        })
        .finally(() => setLoading(false))
      ).finally(() => setLoading(false))
  }, [userInfo.id])

  return <Container1 style={styles.container}>
        <Label style={styles.marginVertical10}>
            Empresa
        </Label>
        <ContainerPickerView>
            <Picker
                placeholderTextColor={placeholderTextColor}
                style={defaultStyle.text}
                itemStyle={defaultStyle.itemStyle}
                label="Empresa"
                selectedValue={subEmpresa}
                onValueChange={(value, _) => setSubEmpresaId(value)}
            >
                <Picker.Item color={pickerItemColor} key={'sub-empresa-selecionar'} value={0} label="Selecione" />
                {(subEmpresas || []).map((item, key) => <Picker.Item color={pickerItemColor} key={`sub-empresa-id-${key}`} value={item.id} label={item.nome} />)}
            </Picker>
        </ContainerPickerView>
        <ModalBasic
            loading={loading}
            message="Carregando..."
        />
        <TouchableOpacityButtonPrimary
            disabled={loading}
            onSubmit={trocarSubEmpresa}
            label="TROCAR EMPRESA"
            style={styles.marginVertical10}
        />
    </Container1>
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingHorizontal: 10
  },
  marginVertical10: {
    marginVertical: 10
  }
})

export default TrocarEmpresa
