import { Entypo } from '@expo/vector-icons'
import React, { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'

import TouchableOpacityButtonDanger from '../../components/Buttons/TouchableOpacityButtonDanger'
import AlertButtons from '../../components/Modal/AlertButtons'
import ModalLoading from '../../components/Modal/ModalLoading'
import { Label, SafeAreaView1 } from '../../components/style'
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

const LimparDadosScreen = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [abrirButtons, setAbrirButtons] = useState(false)

  const limparDados = async () => {
    try {
      setMessage('Limpando estoque')
      await EstoqueDAO.RemoveAll()

      setMessage('Limpando pedidos')
      await PedidoDAO.RemoveAll()

      setMessage('Limpando produtos')
      await ProdutoDAO.RemoveAll()

      setIsLoading(true)
      setMessage('Limpando cidades')
      await CidadeDAO.RemoveAll()

      setMessage('Limpando formas de pagamento')
      await FormaPagamentoDAO.RemoveAll()

      setMessage('Limpando unidades de produto')
      await UnidadeProdutoDAO.RemoveAll()

      setMessage('Limpando marcas de produto')
      await MarcaProdutoDAO.RemoveAll()

      setMessage('Limpando grupos de produto')
      await GrupoProdutoDAO.RemoveAll()

      setMessage('Limpando clientes')
      await ClienteDAO.RemoveAll()

      setMessage('Limpando financeiro')
      await FinanceiroDAO.RemoveAll()

      setMessage('Limpando log')
      await LogDAO.RemoveAll()

      Alert.alert('Removido com sucesso!', 'Todos os cadastros/pedidos foram removidos com sucesso')
    } catch (error) {
      Alert.alert('Erro', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView1>
      <ModalLoading
        isLoading={isLoading}
        message={message}
      />
      <AlertButtons
        visible={abrirButtons}
        title={'Limpar dados'}
        subTitle={'Deseja mesmo limpar os dados? Essa é uma tarefa IRREVERSÍVEL!'}
        buttons={[
          {
            label: 'Limpar',
            onPress: (r) => {
              limparDados()
              setAbrirButtons(r)
            }
          },
          { label: 'Cancelar', onPress: (r) => setAbrirButtons(r) }
        ]}
      />
      <View style={styles.warning}>
        <Entypo name="warning" size={80} color="red" />
        <Label style={styles.textWarning}>
          CUIDADO
        </Label>
        <View style={{ marginTop: 30, display: 'flex', alignItems: 'center' }}>
          <Label style={styles.textMessage}>
            SE VOCÊ LIMPAR OS DADOS
          </Label>
          <Label style={styles.textMessage}>
            NÃO PODERÁ MAIS TER ACESSO A ELES!
          </Label>
        </View>
        <View style={{ marginTop: 20 }}>
          <TouchableOpacityButtonDanger
            onSubmit={() => setAbrirButtons(true)}
            label="LIMPAR DADOS"
            disabled={isLoading}
          />
        </View>
      </View>
    </SafeAreaView1>
  )
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

export default LimparDadosScreen
