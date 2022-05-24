import { useFocusEffect, useNavigation } from '@react-navigation/native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { Divider } from 'react-native-elements'
import FloatingButton from '../../components/Buttons/FloatingButton'
import TouchableOpacityButtonResetFilter from '../../components/Buttons/TouchableOpacityButtonResetFilter'
import AlertButtons from '../../components/Modal/AlertButtons'
import { AsyncStorageSync } from '../../components/Modal/ModalLoading'
import { ClienteContext, SyncContext } from '../../components/navigation/contexts'
import {
  FlatList1,
  FormFilter,
  Input,
  Label,
  Label18,
  Label18Bold,
  LabelBold,
  ListItemButtom3,
  SafeAreaView1,
  useDefaultStyleSheet
} from '../../components/style'
import ClienteDAO from '../../db/ClienteDao'
import { useDebounce } from '../../hooks/useDebounce'
import { removeDuplicatesFromList } from '../../util/collections'
import { formatarCpfOuCnpj } from '../../util/formatString'

const Item = ({ item: { apelido, cpf, endereco, telefone, numero, inativo, bloqueado, nomeRazao, nomeCidade, uf, tempId, vendedores }, navigation }) => {
  const [abrirButtons, setAbrirButtons] = useState(false)
  const navigateToHistorico = () => {
    return navigation.navigate('Historico', { clienteTempId: tempId })
  }

  const navigateToView = () => {
    return navigation.navigate('NewCliente', { tempId })
  }

  return (
    <ListItemButtom3 onPress={navigateToView} onLongPress={() => setAbrirButtons(true)}>
      <View>
        <LabelBold style={styles.textBold}>
          {(apelido).toUpperCase() || (nomeRazao).toUpperCase()}
        </LabelBold>
        <LabelBold style={styles.textBoldNome}>
          {(nomeRazao).toUpperCase()}
        </LabelBold>
      </View>
      <View style={styles.row}>
        <Label>{`CPF/CNPJ: ${formatarCpfOuCnpj(cpf)}`}</Label>
        <Label style={styles.textRight}>{`${telefone}`}</Label>
      </View>
      <View style={styles.row}>
        <Label>{`${(endereco).toUpperCase()}`}</Label>
        <Label style={styles.textRight}>{`NÚMERO: ${numero}`}</Label>
      </View>
      <View style={styles.row}>
        <Label>{(nomeCidade).toUpperCase() || ''}</Label>
        <Label style={styles.textRight}>{uf || ''}</Label>
        <Label style={styles.textRight}>{(inativo || '').toLowerCase() === 'sim' ? 'INATIVO' : 'ATIVO'}</Label>
        <Label style={styles.textRight}>{(bloqueado || '').toLowerCase() === 'sim' ? 'BLOQUEADO' : 'REGULAR'}</Label>
      </View>
      <AlertButtons
        visible={abrirButtons}
        title={apelido || nomeRazao}
        subTitle={'O que deseja fazer com esse cliente?'}
        buttons={[
          {
            label: 'Histórico',
            onPress: (r) => {
              navigateToHistorico()
              setAbrirButtons(r)
            }
          },
          { label: 'Cancelar', onPress: (r) => setAbrirButtons(r) }
        ]}
      />
    </ListItemButtom3>
  )
}

const ClienteScreen = () => {
  const { defaultStyle, placeholderTextColor } = useDefaultStyleSheet()
  const navigation = useNavigation()
  const { filterOpen, setFilterOpen } = useContext(ClienteContext)
  const { sync } = useContext(SyncContext)
  const [listCliente, setListCliente] = useState([])
  const [nomeCliente, setNomeCliente] = useState('')
  const debouncedNomeCliente = useDebounce(nomeCliente, 300)
  const [cpfOrCnpj, setCpfOrCnpj] = useState('')
  const debouncedCpfOrCnpj = useDebounce(cpfOrCnpj, 300)
  const [offset, setOffset] = useState(0)
  const [listagemCompleta, setListagemCompleta] = useState(false)
  const [totalGeral, setTotalGeral] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const renderItem = useCallback(({ item }) => <Item item={item} navigation={navigation} />, [navigation])

  useFocusEffect(useCallback(() => {
    setListagemCompleta(false)
    setOffset(0)
    setRefreshing(true)
    ClienteDAO.FilterCliente(debouncedNomeCliente, debouncedCpfOrCnpj)
      .then(r => setListCliente(r))
      .finally(() => setRefreshing(false))
    ClienteDAO.GetCount(debouncedNomeCliente, debouncedCpfOrCnpj)
      .then(r => setTotalGeral(r))
  }, [debouncedCpfOrCnpj, debouncedNomeCliente]))

  useFocusEffect(useCallback(() => {
    setFilterOpen(false)
    AsyncStorageSync({ sync })
  }, [setFilterOpen, sync]))

  const atualizarListaOffset = useCallback(() => {
    if (!offset) return

    setRefreshing(true)

    ClienteDAO.FilterCliente(debouncedNomeCliente, debouncedCpfOrCnpj, offset).then(r => {
      if (!r.length) {
        setListagemCompleta(true)
        return
      }
      setListCliente(removeDuplicatesFromList([...listCliente, ...r], 'tempId'))
    }).finally(() => setRefreshing(false))
    ClienteDAO.GetCount(debouncedNomeCliente, debouncedCpfOrCnpj)
      .then(r => setTotalGeral(r))
  }, [debouncedCpfOrCnpj, debouncedNomeCliente, listCliente, offset])

  useEffect(() => {
    atualizarListaOffset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset])

  const resetFilters = useCallback(() => {
    setNomeCliente('')
    setCpfOrCnpj('')
  }, [])

  const formFilters = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <FormFilter>
          <View>
            <Label18 style={styles.textFilter}>
              Nome do cliente
            </Label18>
            <Input onChangeText={setNomeCliente} value={nomeCliente} maxLength={40} placeholder="Ex: Alpha Software" placeholderTextColor={placeholderTextColor}></Input>
          </View>
          <View>
            <Label18 style={styles.textFilter}>
              CPF/CNPJ (sem pontos)
            </Label18>
            <View style={styles.rowRemoveFilter}>
              <Input onChangeText={setCpfOrCnpj} value={cpfOrCnpj} maxLength={40} placeholder="Ex: 12345678910" style={{ width: '85%' }} placeholderTextColor={placeholderTextColor} keyboardType="number-pad"></Input>
              <View style={{ paddingLeft: 5 }}>
                <TouchableOpacityButtonResetFilter onSubmit={resetFilters} />
              </View>
            </View>
          </View>
        </FormFilter>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView >
  )

  const refresh = useCallback(() => {
    Alert.alert(
      'Deseja sincronizar?',
      'Isso pode demorar alguns instantes',
      [
        {
          text: 'Ok',
          onPress: () => {
            sync()
          }
        },
        {
          text: 'Cancelar'
        }
      ]
    )
  }, [sync])

  return (
    <SafeAreaView1>
      {filterOpen && formFilters()}
      <Label18Bold style={styles.textDateImportCard}>
        Exibindo {listCliente.length} de {totalGeral} clientes
      </Label18Bold>
      <FlatList1
        refreshing={refreshing}
        onEndReached={() => {
          if (!listagemCompleta) setOffset(offset + 20)
        }}
        onEndReachedThreshold={0.1}
        data={listCliente}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${index}-${item.id}-${item.apelido}`}
        ItemSeparatorComponent={() => <Divider style={defaultStyle.lineDivider} />}
        ListEmptyComponent={() => <Label18>{'Não há itens para exibir'}</Label18>}
        ListFooterComponent={() => refreshing && (
          <View>
            <Label>Carregando Clientes...</Label>
          </View>
        )}
        refreshControl={<RefreshControl
          colors={['#0A7AC3']}
          refreshing={refreshing}
          onRefresh={refresh}
        />}
        onScrollBeginDrag={() => setFilterOpen(false)}
      />
      <FloatingButton
        icon="plus"
        style={styles.floatinBtn}
        onPress={() => navigation.navigate('NewCliente')}
      />
    </SafeAreaView1>
  )
}

const styles = StyleSheet.create({
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  rowRemoveFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  text: {
    fontWeight: 'normal'
  },
  textDateImportCard: {
    padding: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#0A7AC3'
  },
  textBold: {
    fontSize: 17
  },
  textBoldNome: {
    fontSize: 16
  },
  textRight: {
    paddingLeft: 10
  },
  buttonResetFilter: {
    backgroundColor: '#da4234',
    borderRadius: 5,
    padding: 5,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  textFilter: {
    paddingTop: 5,
    paddingBottom: 5
  },
  filters: {
    padding: 10
  },
  floatinBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10
  },
  textNotItems: {
    fontSize: 18
  }
})

export default ClienteScreen
