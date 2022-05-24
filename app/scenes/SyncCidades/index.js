import { Entypo } from '@expo/vector-icons'
import React, { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { CidadeService } from '../../api/cidade'
import TouchableOpacityButtonSuccess from '../../components/Buttons/TouchableOpacityButtonSuccess'
import { ModalBasic } from '../../components/Modal/ModalLoading'
import { Label, Label18, SafeAreaView1, useDefaultStyleSheet } from '../../components/style'
import { checkConnection } from '../../hooks/useNetworkStatus'

const SyncCidadesScreen = () => {
  const { textPrimaryColor } = useDefaultStyleSheet()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const syncCidade = async () => {
    try {
      if (!await checkConnection()) {
        return Alert.alert('Offline', 'Não foi possível sincronizar, você está offline!')
      }

      setLoading(true)
      setMessage('Sincronizando cidades')

      await CidadeService.RemoverTodos()
      await CidadeService.Obter()

      setMessage('Sincronizado com sucesso!')
    } catch (error) {
      Alert.alert('Erro', error.message)
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 3000)
    }
  }

  return <SafeAreaView1>
        <View style={styles.warning}>
            <Entypo name="info" size={80} color={textPrimaryColor} />
            <Label style={[styles.textWarning, { marginTop: 20 }]}>
                SINCRONIZAÇÃO
            </Label>
            <View style={{ marginVertical: 30, display: 'flex', alignItems: 'center' }}>
                <Label18>
                    AS CIDADES SÃO OBTIDAS PELO
                </Label18>
                <Label18>
                    SERVIÇO DE DADOS DO IBGE
                </Label18>
            </View>
            <View style={{ display: 'flex', alignItems: 'center' }}>
                <TouchableOpacityButtonSuccess
                    disabled={false}
                    onSubmit={syncCidade}
                    label="SINCRONIZAR"
                />
            </View>
        </View>
        <ModalBasic loading={loading} message={message} />
    </SafeAreaView1>
}

const styles = StyleSheet.create({
  textWarning: {
    fontSize: 30
  },
  textMessage: {
    fontSize: 18
  },
  warning: {
    marginTop: 10,
    flex: 1,
    alignContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default SyncCidadesScreen
