import { Picker } from '@react-native-picker/picker'
import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView, Platform, RefreshControl, StyleSheet,
  TouchableOpacity, TouchableWithoutFeedback, useColorScheme,
  View
} from 'react-native'
import { Divider } from 'react-native-elements'
import TouchableOpacityButtonResetFilter from '../../components/Buttons/TouchableOpacityButtonResetFilter'
import { AsyncStorageSync } from '../../components/Modal/ModalLoading'
import { EstoqueContext, SyncContext } from '../../components/navigation/contexts'
import { ContainerPickerView, FlatList1, FormFilter, Input, Label, Label18, Label18Bold, LabelBold, ListItem2, SafeAreaView1, useDefaultStyleSheet } from '../../components/style'
import ProdutoDAO from '../../db/ProdutoDao'
import TabelaPrecoDAO from '../../db/TabelaPrecoDao'
import { useConfig } from '../../hooks/useConfig'
import { removeDuplicatesFromList } from '../../util/collections'
import { NumberUtil } from '../../util/number'
import { useDebounce } from '../../hooks/useDebounce'

export default () => {
  const { defaultStyle, placeholderTextColor, pickerItemColor, textColorBase, textInfoColor } = useDefaultStyleSheet()

  const { filterOpen, setFilterOpen } = useContext(EstoqueContext)
  const { sync } = useContext(SyncContext)

  const [itens, setItens] = useState([])
  const [contagem, setContagem] = useState(0)

  // Filtro
  const [codigoFiltro, setCodigoFiltro] = useState('')
  const [nomeFiltro, setNomeFiltro] = useState('')
  const [tabelaPrecoFiltro, setTabelaPrecoFiltro] = useState('')

  const debouncedCodigoFiltro = useDebounce(codigoFiltro, 200)
  const debouncedNomeFiltro = useDebounce(nomeFiltro, 200)
  const debouncedTabelaPrecoFiltro = useDebounce(tabelaPrecoFiltro, 200)

  const [offset, setOffset] = useState(0)
  const [buscaCompleta, setBuscaCompleta] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [tabelasPreco, setTabelasPreco] = useState([])
  const [config, refreshConfig] = useConfig()

  const ItemLista = ({ item }) => {
    const scheme = useColorScheme()
    const dark = scheme === 'dark'

    return <View>
      <TouchableOpacity>
        <ListItem2>
          {item.fotoBase64
            ? <>
              <View style={[styles.rowCenter, { justifyContent: 'flex-start' }]}>
                <Image source={{ uri: `data:image/jpeg;base64,${item.fotoBase64}` }} style={{ height: 120, width: 120, marginRight: 15 }} />
                <View>
                  <View style={{ marginBottom: 5 }}>
                    <Label18Bold style={{ width: 220 }}>
                      {item.nome}
                    </Label18Bold>
                  </View>
                  <View>
                    <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                      <View style={{ flexDirection: 'row' }}>
                        <Label>CÓDIGO:</Label>
                        <LabelBold>{` ${item.codigoInterno}`}</LabelBold>
                      </View>
                    </View>
                    <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                      <View style={{ flexDirection: 'row' }}>
                        <Label>MARCA:</Label>
                        <LabelBold>{` ${item.marca || '--'}`}</LabelBold>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </>
            : (
              <>
                <View style={[styles.rowCenter, { justifyContent: 'flex-start' }]}>
                  {dark
                    ? <Image source={require('../../assets/produtoDark.png')} style={{ height: 120, width: 120, marginRight: 15 }} />
                    : <Image source={require('../../assets/produtoLight.png')} style={{ height: 120, width: 120, marginRight: 15 }} />
                  }
                  <View>
                    <View style={{ marginBottom: 5 }}>
                      <Label18Bold style={{ width: 220 }}>
                        {item.nome}
                      </Label18Bold>
                    </View>
                    <View>
                      <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                        <View style={{ flexDirection: 'row' }}>
                          <Label>CÓDIGO:</Label>
                          <LabelBold>{` ${item.codigoInterno}`}</LabelBold>
                        </View>
                      </View>
                      <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                        <View style={{ flexDirection: 'row' }}>
                          <Label>MARCA:</Label>
                          <LabelBold>{` ${item.marca || '--'}`}</LabelBold>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </>
              )}
          <Divider style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.verticalField}>
              <Label>UN</Label>
              <LabelBold>
                {item.unidade || '--'}
              </LabelBold>
            </View>
            <View style={styles.verticalField}>
              <Label>ESTOQUE</Label>
              <LabelBold>
                {item.estoqueAtual || '--'}
              </LabelBold>
            </View>
            <View style={styles.verticalField}>
              <Label style={{ color: item.valorVendaTabelado ? textInfoColor : textColorBase }}>VALOR UNITÁRIO</Label>
              <LabelBold style={{ color: item.valorVendaTabelado ? textInfoColor : textColorBase }}>
                {NumberUtil.toDisplayNumber(item.valorVendaTabelado || item.valorVenda, 'R$', true)}
              </LabelBold>
            </View>
          </View>
        </ListItem2>
      </TouchableOpacity>
    </View>
  }

  const resetFilters = () => {
    setCodigoFiltro('')
    setNomeFiltro('')
    setTabelaPrecoFiltro('')
  }

  const formFilters = () => {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <FormFilter>
            <View>
              <Label18>
                Código
              </Label18>
              <Input value={codigoFiltro} onChangeText={e => setCodigoFiltro(e)} maxLength={30} placeholder="Ex: 0001" placeholderTextColor={placeholderTextColor} keyboardType="number-pad" />
            </View>
            <View>
              <Label18>
                Nome do produto
              </Label18>
              <View style={styles.rowRemoveFilter}>
                <Input value={nomeFiltro} onChangeText={e => setNomeFiltro(e)} maxLength={40} placeholder="Ex: Coca Cola" style={{ width: '85%' }} placeholderTextColor={placeholderTextColor} />
                <View style={{ paddingLeft: 5 }}>
                  <TouchableOpacityButtonResetFilter onSubmit={resetFilters} />
                </View>
              </View>
            </View>
            {config.usarTabelaPrecos && <View>
              <Label18>
                Tabela de preço
              </Label18>
              <ContainerPickerView style={{ padding: 10 }}>
                <Picker
                  placeholderTextColor={placeholderTextColor}
                  style={[defaultStyle.text]}
                  itemStyle={defaultStyle.itemStyle}
                  label="Tabela de preço"
                  selectedValue={tabelaPrecoFiltro}
                  onValueChange={(itemValue) => setTabelaPrecoFiltro(itemValue)}
                >
                  <Picker.Item color={pickerItemColor} label="Todas as opções" value="" />
                  {tabelasPreco.map(({ nome, idAlphaExpress, id }) => <Picker.Item key={`formas-pag-${id}-${idAlphaExpress}`} color={pickerItemColor} label={nome.toUpperCase()} value={id} />)}
                </Picker>
              </ContainerPickerView>
            </View>}
          </FormFilter>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    )
  }

  useFocusEffect(useCallback(() => {
    refreshConfig()
    TabelaPrecoDAO.GetList().then(data => setTabelasPreco(data))
    setFilterOpen(false)
    AsyncStorageSync({ sync })
  }, [refreshConfig, setFilterOpen, sync]))

  useFocusEffect(useCallback(() => {
    // reset dos states de busca

    setRefreshing(true)
    setOffset(0)
    setBuscaCompleta(false)
    setNomeFiltro('')
    setCodigoFiltro('')
    setTabelaPrecoFiltro('')

    // busca em si
    ProdutoDAO.GetListComplete({}, 0).then(lista => {
      setItens(lista)
    }).finally(() => setRefreshing(false))
    ProdutoDAO.GetCount({}, 0).then(contagem => {
      setContagem(contagem)
    })
  }, []))

  useEffect(() => {
    setOffset(0)
    setBuscaCompleta(false)

    ProdutoDAO.GetListComplete({ nome: debouncedNomeFiltro, codigo: debouncedCodigoFiltro, tabelaPrecoId: debouncedTabelaPrecoFiltro }, 0).then(lista => setItens(lista))
    ProdutoDAO.GetCount({ nome: debouncedNomeFiltro, codigo: debouncedCodigoFiltro, tabelaPrecoId: debouncedTabelaPrecoFiltro }).then(contagem => setContagem(contagem))
  }, [debouncedNomeFiltro, debouncedCodigoFiltro, debouncedTabelaPrecoFiltro])

  const atualizarListagemOffset = useCallback(() => {
    if (buscaCompleta || !offset) {
      return
    }
    setRefreshing(true)
    ProdutoDAO.GetListComplete({ nome: nomeFiltro, codigo: codigoFiltro, tabelaPrecoId: tabelaPrecoFiltro }, offset)
      .then(lista => {
        if (!lista.length) {
          setBuscaCompleta(true)
          return
        }
        setItens(removeDuplicatesFromList([...itens, ...lista], 'id'))
      }).finally(() => setRefreshing(false))
    ProdutoDAO.GetCount({ nome: debouncedNomeFiltro, codigo: debouncedCodigoFiltro, tabelaPrecoId: debouncedTabelaPrecoFiltro }).then(contagem => setContagem(contagem))
  }, [buscaCompleta, codigoFiltro, debouncedCodigoFiltro, debouncedNomeFiltro, debouncedTabelaPrecoFiltro, itens, nomeFiltro, offset, tabelaPrecoFiltro])

  useEffect(() => {
    atualizarListagemOffset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset])

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

  const renderItem = useCallback(({ item }) => <ItemLista item={item} />, [])

  return <SafeAreaView1>
    <View style={{ flex: 1, marginTop: 10, paddingBottom: 2 }}>
      {filterOpen && formFilters()}
      <Label18Bold style={styles.textDateImportCard}>
        Exibindo {itens.length} de {contagem} produtos
      </Label18Bold>
      <FlatList1
        maxToRenderPerBatch={5}
        initialNumToRender={5}
        removeClippedSubviews
        refreshing={refreshing}
        onEndReached={() => {
          if (!buscaCompleta) setOffset(offset + 20)
        }}
        refreshControl={<RefreshControl
          colors={['#0A7AC3']}
          refreshing={refreshing}
          onRefresh={refresh}
        />}
        onEndReachedThreshold={0.01}
        data={itens}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${index}-${item.idAlphaExpress}`}
        ListEmptyComponent={() => <Label18>Não há itens para exibir</Label18>}
        ListFooterComponent={() => refreshing && (
          <View>
            <Label>Carregando Produtos...</Label>
          </View>
        )}
        onScrollBeginDrag={() => {
          setFilterOpen(false)
        }}
        ItemSeparatorComponent={() => <Divider style={defaultStyle.lineDivider} />}
      />
    </View>
  </SafeAreaView1>
}

const styles = StyleSheet.create({
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  rowRemoveFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  filterRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  rowCenter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  textBold: {
    fontWeight: 'bold'
  },
  fontSize18: {
    fontSize: 18
  },
  verticalField: {
    display: 'flex',
    flexDirection: 'column'
  },
  divider: {
    backgroundColor: '#C1BFC0',
    marginTop: 6,
    marginBottom: 4
  },
  lineDivider: {
    backgroundColor: '#C1BFC0',
    marginTop: 6,
    marginBottom: 4,
    borderWidth: 1
  },
  input: {
    borderWidth: 1,
    borderColor: '#0A7AC3',
    paddingLeft: 2,
    paddingRight: 2
  },
  textFilter: {
    color: 'black',
    paddingTop: 5,
    paddingBottom: 5,
    fontSize: 18
  },
  textNotItems: {
    fontSize: 18
  },
  filters: {
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#0A7AC3',
    backgroundColor: 'white'
  }

})
