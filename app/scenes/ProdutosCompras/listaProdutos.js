import { Picker } from '@react-native-picker/picker'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { Divider } from 'react-native-elements/dist/divider/Divider'
import FloatingButtonCarrinho from '../../components/Buttons/FloatingButtonNumber'
import TouchableOpacityButtonResetFilter from '../../components/Buttons/TouchableOpacityButtonResetFilter'
import { CompraContext } from '../../components/navigation/contexts'
import {
  ContainerPickerView,
  FormFilter,
  Input,
  Label18,
  LabelInfo,
  SafeAreaView1,
  ScrollView1,
  useDefaultStyleSheet
} from '../../components/style'
import FormaPagamentoDAO from '../../db/FormaPagamentoDao'
import ProdutoDAO from '../../db/ProdutoDao'
import TabelaPrecoDAO from '../../db/TabelaPrecoDao'
import { useConfig } from '../../hooks/useConfig'
import { useDebounce } from '../../hooks/useDebounce'
import { usePermissions } from '../../hooks/usePermissions'
import { createUUID } from '../../util/guid'
import { ItemLista } from './itens'

export default () => {
  const { defaultStyle, placeholderTextColor, pickerItemColor } = useDefaultStyleSheet()
  const { selecionados, adicionarItem, produtoSelecionadoIndex, setProdutoSelecionadoIndex } = useContext(CompraContext)

  const route = useRoute()
  const navigation = useNavigation()
  const [itens, setItens] = useState([])
  // Filtro
  const [nomeFiltro, setNomeFiltro] = useState('')
  const [tabelaPrecoFiltro, setTabelaPrecoFiltro] = useState('')

  // Filtros com debounce
  const debouncedNomeFiltro = useDebounce(nomeFiltro, 500)

  const [tabelasPreco, setTabelasPreco] = useState([])

  const [config, refreshConfig] = useConfig()
  const [permissions, refreshPermissions] = usePermissions()
  const formaPagamentoId = route?.params?.formaPagamentoId

  // Lista
  const [dataSourceCords, setDataSourceCords] = useState([])
  const ref = useRef(null)

  const scrollHandler = (index) => {
    if (dataSourceCords.length > index) {
      ref.current.scrollTo({
        x: 0,
        y: dataSourceCords[index - 1],
        animated: true
      })
    } else {
      alert('Out of Max Index')
    }
  }

  const resetFilters = () => {
    setNomeFiltro('')
    setTabelaPrecoFiltro('')
  }

  const total = useMemo(() => selecionados?.map((q) => q.valorTotal).reduce((prev, curr) => prev + curr, 0), [selecionados])

  useFocusEffect(useCallback(() => {
    // reset dos states de busca
    refreshConfig()
    refreshPermissions()
    // busca em si
    executarFiltro(0)

    TabelaPrecoDAO
      .GetList()
      .then(data => setTabelasPreco(data))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshConfig, refreshPermissions]))

  const executarFiltro = useCallback(() => {
    // busca em si
    ProdutoDAO
      .GetListComplete({ nome: debouncedNomeFiltro, tabelaPrecoId: tabelaPrecoFiltro })
      .then(lista => setItens(lista))
  }, [debouncedNomeFiltro, tabelaPrecoFiltro])

  useEffect(() => {
    executarFiltro()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedNomeFiltro, tabelaPrecoFiltro])

  useEffect(() => {
    const init = async () => {
      if (!formaPagamentoId || !tabelasPreco?.length) {
        return
      }

      const formaPagamento = await FormaPagamentoDAO.GetById(formaPagamentoId)
      setTabelaPrecoFiltro(formaPagamento.tabelaPrecoId)
    }

    init()
  }, [formaPagamentoId, tabelasPreco])

  return <SafeAreaView1>
    <View style={{ flex: 1, paddingBottom: 5, paddingTop: 5 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <FormFilter style={styles.filters}>
            <View>
              <Label18>
                Produto/Código
              </Label18>
              <View style={styles.rowRemoveFilter}>
                <Input autoCorrect={false} value={nomeFiltro} style={{ width: '85%' }} onChangeText={setNomeFiltro} maxLength={40} placeholder="Ex: Coca Cola" placeholderTextColor={placeholderTextColor} />
                <View style={{ paddingLeft: 5 }}>
                  <TouchableOpacityButtonResetFilter onSubmit={resetFilters} />
                </View>
              </View>
            </View>
            {config.usarTabelaPrecos && <View>
              <Label18>
                Tabela de preço
              </Label18>
              <ContainerPickerView>
                <Picker
                  placeholderTextColor={placeholderTextColor}
                  style={defaultStyle.text}
                  itemStyle={defaultStyle.itemStyle}
                  label="Tabela de preço"
                  selectedValue={tabelaPrecoFiltro}
                  onValueChange={setTabelaPrecoFiltro}
                >
                  <Picker.Item key="tabela-preco-nenhum" color={pickerItemColor} label="Nenhum" value="" />
                  {tabelasPreco.map(({ id, nome }) => <Picker.Item key={`${id}-${nome}`} color={pickerItemColor} label={nome.toUpperCase()} value={id} />)}
                </Picker>
              </ContainerPickerView>
            </View>}
            <LabelInfo>(A busca retorna no máximo 20 produtos)</LabelInfo>
          </FormFilter>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      {!itens.length && <Label18>Não há itens para exibir</Label18>}
      {!!itens.length && <ScrollView1 ref={ref}>
        {itens.map((item, index) => <View
          key={createUUID()}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout
            dataSourceCords[index] = layout.y
            setDataSourceCords(dataSourceCords)
          }}>
          <ItemLista
            produtoSelecionadoIndex={produtoSelecionadoIndex}
            setProdutoSelecionadoIndex={setProdutoSelecionadoIndex}
            submit={adicionarItem}
            item={item}
            index={index}
            config={config}
            permissions={permissions}
            onItemPress={() => scrollHandler(index)}
          />
          <Divider />
        </View>)}
      </ScrollView1>}
      {!!selecionados?.length && <View style={{ marginBottom: 50 }}></View>}
      {!!selecionados?.length && <FloatingButtonCarrinho
        number={selecionados?.length}
        icon="shoppingcart"
        style={styles.floatingBtn}
        onPress={() => {
          setProdutoSelecionadoIndex(null)
          navigation.navigate('CarrinhoCompra')
        }}
        total={total}
      />}
    </View>
  </SafeAreaView1>
}

const styles = StyleSheet.create({
  dateImportCard: {
    borderRadius: 5,
    padding: 10
  },
  rowRemoveFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  lineDivider: {
    backgroundColor: '#C1BFC0',
    marginTop: 6,
    marginBottom: 4,
    borderWidth: 1
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
    borderBottomWidth: 2,
    borderBottomColor: '#0A7AC3'
  },
  floatingBtn: {
    position: 'absolute',
    bottom: 5,
    width: '100%',
    height: 50
  }
})
