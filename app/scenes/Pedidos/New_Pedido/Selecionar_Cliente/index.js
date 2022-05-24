import { useFocusEffect, useNavigation } from '@react-navigation/native'
import moment from 'moment'
import React, { useCallback, useState } from 'react'
import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import {
  FlatList1,
  FormFilter,
  Input,
  Label,
  LabelBold,
  ListItemButtom2,
  SafeAreaView1,
  useDefaultStyleSheet
} from '../../../../components/style'
import ClienteDao from '../../../../db/ClienteDao'
import FinanceiroDAO from '../../../../db/FinanceiroDao'
import { useConfig } from '../../../../hooks/useConfig'
import { useDebounce } from '../../../../hooks/useDebounce'
import { removeDuplicatesFromList } from '../../../../util/collections'
import { formatarCpfOuCnpj } from '../../../../util/formatString'
import { NumberUtil } from '../../../../util/number'

const SelectCliente = () => {
  const { placeholderTextColor } = useDefaultStyleSheet()
  const [listCliente, setListCliente] = useState([])
  const [cliente, setCliente] = useState('')
  const [offset, setOffset] = useState(0)
  const [listagemCompleta, setListagemCompleta] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [config, refreshConfig] = useConfig()
  const navigation = useNavigation()

  const debouncedCliente = useDebounce(cliente, 200)

  useFocusEffect(useCallback(() => {
    setOffset(0)
    setListagemCompleta(false)
    setRefreshing(true)
    refreshConfig()
    ClienteDao.Filter(cliente, 0).then(r => setListCliente(r)).finally(() => setRefreshing(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCliente, refreshConfig]))

  React.useEffect(() => {
    if (!offset || listagemCompleta) return

    setRefreshing(true)
    ClienteDao.Filter(cliente, offset).then(r => {
      if (!r.length) {
        setListagemCompleta(true)
        return
      }

      setListCliente(removeDuplicatesFromList([...listCliente, ...r], 'id'))
    }).finally(() => setRefreshing(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset])

  const itemPress = useCallback(async (id, apelido, nomeRazao, aviso) => {
    const listaFinanceiro = await FinanceiroDAO.GetByCliente(id)

    const finalizar = () => {
      if (listaFinanceiro.length && !config.ocultarAlertaFinanceiro && nomeRazao !== 'A B  CONSUMIDOR FINAL') {
        Alert.alert(
          'Aviso',
          `${apelido} possui títulos em aberto:\n\n${listaFinanceiro.map(item => `${moment(item.dataVencimento).format('DD/MM/YYYY')} - ${NumberUtil.toDisplayNumber(item.valor)}`).join('\n')}\n\nDeseja vender mesmo assim?`,
          [
            {
              text: 'Ok',
              onPress: () => navigation.navigate('NewPedido', { clienteParam: { id, apelido, nomeRazao } }),
              style: 'default'
            },
            {
              text: 'Cancelar',
              style: 'cancel'
            }
          ],
          {
            cancelable: true
          })
      } else {
        navigation.navigate('NewPedido', { clienteParam: { id, apelido, nomeRazao } })
      }
    }

    if (aviso) {
      Alert.alert('Aviso', aviso, [
        {
          style: 'cancel',
          text: 'Cancelar'
        },
        {
          text: 'Selecionar',
          onPress: () => {
            finalizar()
          }
        }
      ])
    } else {
      finalizar()
    }
  }, [config.ocultarAlertaFinanceiro, navigation])

  const Item = useCallback(({ item: { id, nomeRazao, apelido, cpf, endereco, numero, nomeCidade, uf, aviso } }) => {
    return <FormFilter>
      <ListItemButtom2 style={{ padding: 0 }} onPress={() => itemPress(id, apelido, nomeRazao, aviso)}>
        <View>
          <LabelBold style={styles.text19}>
            {apelido.toUpperCase() || nomeRazao.toUpperCase()}
          </LabelBold>
          <Label>
            {nomeRazao.toUpperCase()}
          </Label>
          <Label>
            {formatarCpfOuCnpj(cpf)}
          </Label>
          <Label>
            {endereco}. n°: {numero}
          </Label>
          <Label>
            {nomeCidade} ({uf})
          </Label>
        </View>
      </ListItemButtom2>
    </FormFilter>
  }, [itemPress])

  const renderItem = useCallback(({ item }) => <Item item={item} />, [])

  return <SafeAreaView1>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ paddingTop: 10, paddingLeft: 10, paddingRight: 10 }}>
          <Label>
            CLIENTE/CPF/CNPJ
          </Label>
          <Input
            maxLength={55}
            onChangeText={setCliente}
            value={cliente}
            placeholderTextColor={placeholderTextColor}
            placeholder="Pesquisa Cliente" />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
    <FlatList1
      style={{ marginTop: 15, marginBottom: 2 }}
      ListEmptyComponent={<Label>Nenhum cliente foi encontrado</Label>}
      refreshing={refreshing}
      onEndReached={() => {
        if (!listagemCompleta) setOffset(offset + 20)
      }}
      onEndReachedThreshold={0.01}
      data={listCliente}
      renderItem={renderItem}
      keyExtractor={item => `item-${item.id}`}
      ListFooterComponent={() => refreshing && <View>
        <Label>Carregando itens...</Label>
      </View>}
    />
  </SafeAreaView1>
}

const styles = StyleSheet.create({
  text19: {
    fontSize: 19
  }
})

export default SelectCliente
