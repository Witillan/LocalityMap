import { Picker } from '@react-native-picker/picker'
import { useFocusEffect } from '@react-navigation/native'
import moment from 'moment'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { Divider } from 'react-native-elements'
import { PedidoHistoricoService } from '../../../api/pedidoHistorico'
import AlphaDateInput from '../../../components/Date/AlphaDateInput'
import { ClienteContext } from '../../../components/navigation/contexts'
import {
  ContainerPickerView,
  FlatList1,
  FormFilter,
  Label,
  Label18,
  ListItemButtom3,
  SafeAreaView1,
  useDefaultStyleSheet
} from '../../../components/style'
import HistoricoPedidoDao from '../../../db/HistoricoPedidoDao'
import { checkConnection } from '../../../hooks/useNetworkStatus'
import { removeDuplicatesFromList } from '../../../util/collections'
import { getPeriodValues, PeriodList } from '../../../util/date'
import { NumberUtil } from '../../../util/number'

const Item = ({ idAlphaExpress, subTotal, dataEHora, total, itens }) => {
  const [open, setOpen] = useState(false)
  const { defaultStyle, textColorBase } = useDefaultStyleSheet()
  return (
    <ListItemButtom3 onPress={() => setOpen(!open)}>
      <View style={{ margin: 5 }}>
        <View style={styles.row}>
          <View>
            <Label>
              {`N° ${idAlphaExpress}  `}
            </Label>
          </View>
        </View>
        <View style={styles.textDate}>
          <Label>
            {moment(dataEHora).format('DD/MM/YYYY')}
          </Label>
          <Label style={{ paddingLeft: 10 }}>
            {moment(dataEHora).format('HH:mm')}
          </Label>
        </View>
        <View style={styles.row}>
          <View>
            <Label>Sub-total: {NumberUtil.toDisplayNumber(subTotal, 'R$', true)}</Label>
            <Label>Qtd. itens: {itens.length}</Label>
          </View>
          <Label style={styles.textBold}>{NumberUtil.toDisplayNumber(total, 'R$', true)}</Label>
        </View>
      </View>
      {open && <View style={[defaultStyle.background4, { margin: 5 }]}>
        {itens.map((item, index) => <View style={{ padding: 5 }} key={`subItem-${item.id}-${index}`}>
          <View style={styles.row}>
            <Label>{item.nome}</Label>
            <Label>Qtd: {NumberUtil.toDisplayNumber(item.quantidade)}</Label>
            <Label>Valor unit:{NumberUtil.toDisplayNumber(item.valorUnitario, 'R$', true)}</Label>
          </View>
          <View style={styles.row}>
            <Label>Sub-total: {NumberUtil.toDisplayNumber((item.valorTotal + item.descontoReal), 'R$', true)}</Label>
            <Label>Desc. {NumberUtil.toDisplayNumber(item.descontoPercentual, '%')}</Label>
            <Label>Total: {NumberUtil.toDisplayNumber(item.valorTotal, 'R$')}</Label>
          </View>
          <Divider style={[styles.lineDivider, { borderColor: textColorBase }]} />
        </View>)}
      </View>}
    </ListItemButtom3>
  )
}

const HistoricoScreen = ({ route }) => {
  const { defaultStyle, pickerItemColor } = useDefaultStyleSheet()
  const { clienteTempId } = route?.params

  const { filterOpen, setFilterOpen } = useContext(ClienteContext)

  const [listHistorico, setListHistorico] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [offset, setOffset] = useState(0)
  const [listagemCompleta, setListagemCompleta] = useState(false)

  // controlando campo de data
  const [periodo, setPeriodo] = useState(0)
  const [dateInicio, setDateInicio] = useState(getPeriodValues(0)[0])
  const [dateFim, setDateFim] = useState(getPeriodValues(0)[1])

  const renderItem = useCallback(({ item }) => <Item
    idAlphaExpress={item.idAlphaExpress}
    subTotal={item.subTotal}
    dataEHora={item.dataEHora}
    total={item.total}
    itens={item.itens}
  />, [])

  useFocusEffect(useCallback(() => {
    setListagemCompleta(false)
    setOffset(0)
    setRefreshing(true)

    // Variáveis de data formatada no parâmetro ideal para filtragem
    const dateEntrada = moment(dateInicio).format('YYYY-MM-DDTHH:mm:ss')
    const dateSaida = moment(dateFim).format('YYYY-MM-DDTHH:mm:ss')

    const filtrar = async () => {
      try {
        const { isConnected } = await checkConnection()

        if (isConnected) {
          await PedidoHistoricoService.Sincronizar(dateEntrada, dateSaida, clienteTempId)
        }

        await HistoricoPedidoDao.FiltroHistoricoCliente(dateEntrada, dateSaida, clienteTempId, 0).then(r => setListHistorico(r))
      } catch (error) {
        Alert.alert('Erro', error)
      } finally {
        setRefreshing(false)
      }
    }

    filtrar()
  }, [clienteTempId, dateFim, dateInicio]))

  const atualizarListaOffset = useCallback(() => {
    if (!offset) return

    setRefreshing(true)

    // Variáveis de data formatada no parâmetro ideal para filtragem
    const dateEntrada = moment(dateInicio).format('YYYY-MM-DDTHH:mm:ss')
    const dateSaida = moment(dateFim).format('YYYY-MM-DDTHH:mm:ss')

    HistoricoPedidoDao.FiltroHistoricoCliente(dateEntrada, dateSaida, clienteTempId, offset).then(r => {
      if (!r.length) {
        setListagemCompleta(true)
        return
      }
      setListHistorico(removeDuplicatesFromList([...listHistorico, ...r], 'id'))
    }).finally(() => setRefreshing(false))
  }, [clienteTempId, dateFim, dateInicio, listHistorico, offset])

  useEffect(() => {
    atualizarListaOffset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset])

  useEffect(() => {
    const a = getPeriodValues(periodo)

    setDateInicio(a[0])
    setDateFim(a[1])
  }, [periodo])

  const formFilters = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <FormFilter style={styles.filters}>
          <View>
            <Label style={styles.textFilter}>
              Periodo
            </Label>
            <ContainerPickerView>
              <Picker
                enabled={!refreshing}
                itemStyle={defaultStyle.itemStyle}
                label="periodo"
                style={[defaultStyle.text]}
                selectedValue={periodo}
                onValueChange={(itemValue) => setPeriodo(itemValue)}
              >
                {PeriodList.map(({ label, value }) => <Picker.Item color={pickerItemColor} key={`periodo-${label}-${value}`} label={label.toUpperCase()} value={value} />)}
              </Picker>
            </ContainerPickerView>
          </View>
          <View>
            <Label style={styles.textFilter}>
              Data inicial
            </Label>
          </View>
          <View>
            <AlphaDateInput onChange={(_, value) => setDateInicio(value)} value={dateInicio} />
          </View>
          <View>
            <Label style={styles.textFilter}>
              Data Final
            </Label>
          </View>
          <View>
            <AlphaDateInput onChange={(_, value) => setDateFim(value)} value={dateFim} />
          </View>
        </FormFilter>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )

  return (
    <SafeAreaView1>
      {filterOpen && formFilters()}
      <FlatList1
        refreshing={refreshing}
        onEndReached={() => {
          if (!listagemCompleta) setOffset(offset + 10)
        }}
        onEndReachedThreshold={0.1}
        data={listHistorico}
        renderItem={renderItem}
        keyExtractor={(_, index) => `item-${index}`}
        ItemSeparatorComponent={() => <Divider style={styles.divider} />}
        ListEmptyComponent={() => <Label18 style={{ marginTop: 10 }}>Não há itens para exibir</Label18>}
        ListFooterComponent={() => refreshing && (
          <View>
            <Label>Carregando Histórico...</Label>
          </View>
        )}
        onScrollBeginDrag={() => setFilterOpen(false)}
      />
    </SafeAreaView1>
  )
}

const styles = StyleSheet.create({
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  textBold: {
    fontWeight: 'bold',
    fontSize: 18
  },
  textDate: {
    flexDirection: 'row',
    fontWeight: 'normal'
  },
  textFilter: {
    paddingTop: 5,
    paddingBottom: 5,
    fontSize: 18
  },
  filters: {
    borderBottomWidth: 2,
    borderBottomColor: '#0A7AC3'
  },
  lineDivider: {
    marginTop: 6,
    marginBottom: 4,
    borderWidth: 1
  },
  divider: {
    marginVertical: 2,
    backgroundColor: 'transparent'
  }
})

export default HistoricoScreen
