import { Entypo } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useState } from 'react'
import { Alert, Modal, StyleSheet, TextInput, View } from 'react-native'

import CidadeDAO from '../../db/CidadeDao'
import ClienteDAO from '../../db/ClienteDao'
import EstoqueDAO from '../../db/EstoqueDao'
import FinanceiroDAO from '../../db/FinanceiroDao'
import FormaPagamentoDAO from '../../db/FormaPagamentoDao'
import GrupoProdutoDAO from '../../db/GrupoProdutoDao'
import LogDAO from '../../db/LogDao'
import MarcaProdutoDAO from '../../db/MarcaProdutoDao'
import PedidoDAO from '../../db/PedidoDao'
import ProdutoDAO from '../../db/ProdutoDao'
import UnidadeProdutoDAO from '../../db/UnidadeProdutoDao'
import { BackupControl } from '../../util/backup'
import { ButtonPrimary, ButtonWarning, Container1, Label, LabelWhite, useDefaultStyleSheet } from '../style'
import { ModalBasic } from './ModalLoading'

const ModalAmbiente = ({ visible, setVisible }) => {
  const [ambiente, setAmbiente] = useState('')

  const { defaultStyle, placeholderTextColor } = useDefaultStyleSheet()

  const [loading, setLoading] = useState(false)

  const limparDados = async () => {
    await EstoqueDAO.Delete()
    await PedidoDAO.Delete()
    await ProdutoDAO.Delete()
    await CidadeDAO.Delete()
    await FormaPagamentoDAO.Delete()
    await UnidadeProdutoDAO.Delete()
    await MarcaProdutoDAO.Delete()
    await GrupoProdutoDAO.Delete()
    await ClienteDAO.Delete()
    await FinanceiroDAO.Delete()
    await LogDAO.RemoveAll()
  }

  const limparBackups = async () => {
    await BackupControl.RemoveAllBackups()
  }

  const escolherAmbiente = async () => {
    if (ambiente.toLowerCase() === 'homologacao') {
      try {
        setLoading(true)
        await AsyncStorage.setItem('Homologacao', 'true')

        limparDados()
        limparBackups()

        Alert.alert('Removido com sucesso!', 'Todos os dados foram removidos com sucesso')
      } catch (error) {
        Alert.alert('Erro', error.message)
      } finally {
        setLoading(false)
        setVisible(false)
      }
    } else if (ambiente.toLowerCase() === 'producao') {
      try {
        setLoading(true)
        await AsyncStorage.setItem('Homologacao', 'false')

        limparDados()

        Alert.alert('Removido com sucesso!', 'Todos os dados foram removidos com sucesso')
      } catch (error) {
        Alert.alert('Erro', error.message)
      } finally {
        setAmbiente('')
        setLoading(false)
        setVisible(false)
      }
    }
  }

  return (
        <Modal animationType={'none'} transparent={true} visible={visible} >
            <Container1>
                <Container1 style={styles.loadingModal}>
                    <Entypo name="warning" size={80} color="red" />
                    <Label style={{ fontSize: 26, paddingVertical: 15 }}>ATENÇÃO</Label>
                    <Label style={{ fontSize: 16 }}>SE VOCÊ TROCAR DE AMBIENTE</Label>
                    <Label style={{ fontSize: 16 }}>TODOS SEUS DADOS SERÃO DELETADOS</Label>
                    <Label style={{ fontSize: 16 }}>DESEJA MESMO FAZER ISSO?</Label>
                    <Label style={{ fontSize: 14 }}>Para qual ambiente você deseja migrar?</Label>
                    <Label style={{ fontSize: 14 }}>Digite o nome do ambiente no campo abaixo!</Label>
                    <TextInput style={[{ marginVertical: 10 }, defaultStyle.input]} placeholderTextColor={placeholderTextColor} placeholder='Digite o ambiente' value={ambiente} onChangeText={setAmbiente}></TextInput>
                    <View style={{ flexDirection: 'row' }}>
                        <ButtonWarning style={{ marginTop: 10, marginRight: 20 }} onPress={() => setVisible(false)}>
                            <LabelWhite>Cancelar</LabelWhite>
                        </ButtonWarning>
                        <ButtonPrimary style={{ marginTop: 10 }} onPress={() => escolherAmbiente()}>
                            <LabelWhite>Confirmar</LabelWhite>
                        </ButtonPrimary>
                    </View>
                </Container1>
                <ModalBasic
                    loading={loading}
                    message={'Limpados dados e trocando de ambiente...'}
                />
            </Container1>
        </Modal >
  )
}

const styles = StyleSheet.create({
  loadingModal: {
    borderRadius: 2,
    padding: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default ModalAmbiente
