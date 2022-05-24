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
import { FornecedorContext, SyncContext } from '../../components/navigation/contexts'
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
import FornecedorDAO from '../../db/FornecedorDao'
import { removeDuplicatesFromList } from '../../util/collections'
import { formatarCpfOuCnpj } from '../../util/formatString'

const Item = ({ item: { apelido, cpf, endereco, telefone, numero, inativo, bloqueado, nomeRazao, nomeCidade, uf, tempId }, navigation }) => {
  const [abrirButtons, setAbrirButtons] = useState(false)
  const navigateToHistorico = () => {
    return navigation.navigate('HistoricoFornecedor', { fornecedorTempId: tempId })
  }

  const navigateToView = () => {
    return navigation.navigate('NewFornecedor', { tempId })
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
        subTitle={'O que deseja fazer com esse fornecedor?'}
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

const FornecedorScreen = () => {
  const { defaultStyle, placeholderTextColor } = useDefaultStyleSheet()
  const navigation = useNavigation()
  const { filterOpen, setFilterOpen } = useContext(FornecedorContext)
  const { sync } = useContext(SyncContext)
  const [listFornecedor, setListFornecedor] = useState([])
  const [nomeFornecedor, setNomeFornecedor] = useState('')
  const [cpfOrCnpj, setCpfOrCnpj] = useState('')
  const [offset, setOffset] = useState(0)
  const [listagemCompleta, setListagemCompleta] = useState(false)
  const [totalGeral, setTotalGeral] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const renderItem = useCallback(({ item }) => (
    <Item
      item={item}
      navigation={navigation}
    />
  ), [navigation])

  useFocusEffect(useCallback(() => {
    setListagemCompleta(false)
    setOffset(0)
    setRefreshing(true)
    FornecedorDAO.FilterFornecedor(nomeFornecedor, cpfOrCnpj).then(r => setListFornecedor(r)).finally(() => setRefreshing(false))
    FornecedorDAO.GetListAll().then(r => setTotalGeral(r.length))
  }, [cpfOrCnpj, nomeFornecedor]))

  useFocusEffect(React.useCallback(() => {
    setFilterOpen(false)
    AsyncStorageSync({ sync })
  }, [setFilterOpen, sync]))

  useFocusEffect(React.useCallback(() => {
    setListagemCompleta(false)
    setOffset(0)
    setRefreshing(true)

    FornecedorDAO.FilterFornecedor(nomeFornecedor, cpfOrCnpj).then(r => setListFornecedor(r)).finally(() => setRefreshing(false))

    FornecedorDAO.GetListAll().then(r => setTotalGeral(r.length))
  }, [nomeFornecedor, cpfOrCnpj]))

  const atualizarListaOffset = useCallback(() => {
    if (!offset) return

    setRefreshing(true)

    FornecedorDAO.FilterFornecedor(nomeFornecedor, cpfOrCnpj, offset).then(r => {
      if (!r.length) {
        setListagemCompleta(true)
        return
      }
      setListFornecedor(removeDuplicatesFromList([...listFornecedor, ...r], 'id'))
    }).finally(() => setRefreshing(false))
  }, [cpfOrCnpj, listFornecedor, nomeFornecedor, offset])

  useEffect(() => {
    if (offset === undefined) return

    atualizarListaOffset()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset])

  const resetFilters = useCallback(() => {
    setNomeFornecedor('')
    setCpfOrCnpj('')
  }, [])

  const formFilters = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <FormFilter>
          <View>
            <Label18 style={styles.textFilter}>
              Nome do fornecedor
            </Label18>
            <Input onChangeText={setNomeFornecedor} value={nomeFornecedor} maxLength={40} placeholder="Ex: Alpha Software" placeholderTextColor={placeholderTextColor}></Input>
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
        Total geral: {totalGeral} | Itens exibidos: {listFornecedor.length}
      </Label18Bold>
      <FlatList1
        refreshing={refreshing}
        onEndReached={() => {
          if (!listagemCompleta) setOffset(offset + 10)
        }}
        onEndReachedThreshold={0.01}
        data={listFornecedor}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${index}-${item.id}-${item.apelido}`}
        ItemSeparatorComponent={() => <Divider style={defaultStyle.lineDivider} />}
        ListEmptyComponent={() => <Label18>{'Não há itens para exibir'}</Label18>}
        ListFooterComponent={() => refreshing && (
          <View>
            <Label>Carregando Fornecedors...</Label>
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
        onPress={() => navigation.navigate('NewFornecedor')}
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

export default FornecedorScreen
