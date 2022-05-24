import { useFocusEffect, useNavigation } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'
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
import FornecedorDao from '../../../../db/FornecedorDao'
import { formatarCpfOuCnpj } from '../../../../util/formatString'

const SelectFornecedor = () => {
  const { placeholderTextColor } = useDefaultStyleSheet()
  const [listFornecedor, setListFornecedor] = useState([])
  const [fornecedor, setFornecedor] = useState('')
  const [offset, setOffset] = useState(0)
  const [listagemCompleta, setListagemCompleta] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const navigation = useNavigation()

  useFocusEffect(useCallback(() => {
    setOffset(0)
    setListagemCompleta(false)
    setRefreshing(true)
    FornecedorDao.Filter(fornecedor, 0).then(r => setListFornecedor(r)).finally(() => setRefreshing(false))
  }, [fornecedor]))

  const atualizarListaOffset = useCallback(() => {
    if (!offset) return

    setRefreshing(true)
    FornecedorDao.Filter(fornecedor, offset).then(r => {
      if (!r.length) {
        setListagemCompleta(true)
        return
      }
      setListFornecedor([...listFornecedor, ...r])
    }).finally(() => setRefreshing(false))
  }, [fornecedor, listFornecedor, offset])

  useEffect(() => {
    atualizarListaOffset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset])

  const Item = ({ item: { id, nomeRazao, apelido, cpf, endereco, numero, nomeCidade, uf, aviso } }) => {
    return <FormFilter>
      <ListItemButtom2 style={{ padding: 0 }} onPress={() => {
        if (aviso) {
          Alert.alert('Aviso', aviso, [
            {
              style: 'cancel',
              text: 'Cancelar'
            },
            {
              text: 'Selecionar',
              onPress: () => {
                navigation.navigate('NewCompra', { fornecedorParam: { id, apelido, nomeRazao } })
              }
            }
          ])
        } else {
          navigation.navigate('NewCompra', { fornecedorParam: { id, apelido, nomeRazao } })
        }
      }}>
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
  }

  const renderItem = useCallback(({ item }) => <Item item={item} />, [])

  return <SafeAreaView1>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ paddingTop: 10, paddingLeft: 10, paddingRight: 10 }}>
          <Label>
            FORNECEDOR/CPF/CNPJ
          </Label>
          <Input
            maxLength={55}
            onChangeText={setFornecedor}
            value={fornecedor}
            placeholderTextColor={placeholderTextColor}
            placeholder="Pesquisa Fornecedor" />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
    <FlatList1
      style={{ marginTop: 15, marginBottom: 2 }}
      ListEmptyComponent={<Label>Nenhum fornecedor foi encontrado</Label>}
      refreshing={refreshing}
      onEndReached={() => {
        if (!listagemCompleta) setOffset(offset + 10)
      }}
      onEndReachedThreshold={0.1}
      data={listFornecedor}
      renderItem={renderItem}
      keyExtractor={item => item.id}
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

export default SelectFornecedor
