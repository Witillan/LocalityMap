import { Picker } from '@react-native-picker/picker'
import { useFocusEffect } from '@react-navigation/native'
import moment from 'moment'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { Card, Divider } from 'react-native-elements'

import TouchableOpacityButtonResetFilter from '../../components/Buttons/TouchableOpacityButtonResetFilter'
import AlphaDateInput from '../../components/Date/AlphaDateInput'
import { AsyncStorageSync } from '../../components/Modal/ModalLoading'
import { FinanceiroContext, SyncContext } from '../../components/navigation/contexts'
import { ContainerPickerView, FormFilter, Label, Label18, ScrollView1, useDefaultStyleSheet } from '../../components/style'
import FinanceiroDAO from '../../db/FinanceiroDao'
import { useDebounce } from '../../hooks/useDebounce'
import { removeDuplicatesFromList } from '../../util/collections'
import { getPeriodValues, PeriodList } from '../../util/date'
import { NumberUtil } from '../../util/number'

const Item = ({ item: { nomeRazao, situacao, dataPagamento, dataVencimento, tipoDocumento, valor } }) => {
  const { defaultStyle } = useDefaultStyleSheet()
  return <TouchableOpacity>
    <View style={[defaultStyle.listItem, defaultStyle.background3]}>
      <View style={styles.row}>
        <Text style={[styles.textRazao, defaultStyle.text]}>
          {nomeRazao}
        </Text>
      </View>
      <View style={[styles.textDate]}>
        <Text style={defaultStyle.text}>
          Venc: {moment(dataVencimento).format('DD/MM/YYYY')}
        </Text>
        {dataPagamento && <Text style={[{ paddingLeft: 10 }, defaultStyle.text]}>
          Pag: {moment(dataPagamento).format('DD/MM/YYYY')}
        </Text>}
      </View>
      <View>
        <Text style={[styles.textPagamento, defaultStyle.text]}>{tipoDocumento}</Text>
      </View>
      <View style={[styles.row, defaultStyle.text]}>
        <Text style={[styles.textBold, defaultStyle.text]}>{NumberUtil.toDisplayNumber(valor, 'R$', true, 2)}</Text>
        <View>
          {situacao !== 'Quitado' ? (
            <Card containerStyle={styles.abertoAlert}>
              <Text style={{ color: 'white' }}>ABERTO</Text>
            </Card>
          ) : (
            <Card containerStyle={styles.pagoSuccess}>
              <Text style={{ color: 'white' }}>QUITADO</Text>
            </Card>
          )}
        </View>
      </View>
    </View>
  </TouchableOpacity>
}

const FinanceiroScreen = () => {
  const screen = Dimensions.get('window')
  const { defaultStyle, placeholderTextColor, pickerItemColor } = useDefaultStyleSheet()
  const { filterOpen, setFilterOpen } = useContext(FinanceiroContext)
  const { sync } = useContext(SyncContext)

  // Controlar campos de filtro
  const [situacao, setSituacao] = useState('')
  const [nomeRazao, setNomeRazao] = useState('')
  const [tipoData, setTipoData] = useState('')

  const debouncedSituacao = useDebounce(situacao, 200)
  const debouncedNomeRazao = useDebounce(nomeRazao, 200)
  const debouncedTipoData = useDebounce(tipoData, 200)

  // controlando campo de data
  const [periodo, setPeriodo] = useState(0)
  const [dateInicio, setDateInicio] = useState(getPeriodValues(0)[0])
  const [dateFim, setDateFim] = useState(getPeriodValues(0)[1])

  const [listFinanceiro, setListFinanceiro] = useState([])
  const [totalGeral, setTotalGeral] = useState(0)
  const [listagemCompleta, setListagemCompleta] = useState(false)
  const [offset, setOffset] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const filtros = useMemo(() => ({
    tipoData: debouncedTipoData,
    nomeRazao: debouncedNomeRazao,
    situacao: debouncedSituacao
  }), [debouncedSituacao, debouncedNomeRazao, debouncedTipoData])

  const renderItem = useCallback(({ item }) => <Item item={item} />, [])

  const resetFilters = () => {
    setNomeRazao('')
    setSituacao('')
    setTipoData('')
    setPeriodo(0)
    setDateInicio(getPeriodValues(0)[0])
    setDateFim(getPeriodValues(0)[1])
  }

  const formFilters = () => {
    return <KeyboardAvoidingView
      contentContainerStyle={defaultStyle.background1}
      behavior={Platform.select({ ios: 'padding' })}
      keyboardVerticalOffset={Platform.OS === 'ios' ? screen.height * 0.10 : screen.height}
    >
      <ScrollView1>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <FormFilter>
            <View>
              <Label18 style={styles.textFilter}>
                Razão Social
              </Label18>
              <TextInput onChangeText={setNomeRazao} value={nomeRazao} maxLength={40} placeholderTextColor={placeholderTextColor} placeholder="Ex: Alpha Software" style={defaultStyle.input}></TextInput>
            </View>
            <View>
              <Text style={[styles.textFilter, defaultStyle.text]}>
                Situação
              </Text>
              <View style={defaultStyle.viewPicker}>
                <Picker
                  style={defaultStyle.text}
                  itemStyle={defaultStyle.itemStyle}
                  label={'Situacao'}
                  selectedValue={situacao}
                  onValueChange={(itemValue) => setSituacao(itemValue)}
                >
                  <Picker.Item label="Selecione uma opção" value="" />
                  <Picker.Item label="Aberto" value="aberto" />
                  <Picker.Item label="Quitado" value="quitado" />
                </Picker>
              </View>
            </View>
            <View>
              <Text style={[styles.textFilter, defaultStyle.text]}>
                Data à filtrar
              </Text>
              <View style={styles.rowRemoveFilter}>
                <ContainerPickerView style={{ width: '85%' }}>
                  <Picker
                    enabled={!refreshing}
                    style={defaultStyle.text}
                    itemStyle={defaultStyle.itemStyle}
                    label="tipoData"
                    selectedValue={tipoData}
                    onValueChange={(itemValue) => setTipoData(itemValue)}
                  >
                    <Picker.Item label="Selecione uma opção" value="" />
                    <Picker.Item label="Data de Vencimento" value="vencimento" />
                    <Picker.Item label="Data de Pagamento" value="pagamento" />
                  </Picker>
                </ContainerPickerView>
                <View style={{ paddingLeft: 5 }}>
                  <TouchableOpacityButtonResetFilter
                    onSubmit={resetFilters}
                  />
                </View>
              </View>
            </View>
            {tipoData ? <View>
              <View>
                <Label style={styles.textFilter}>
                  Periodo
                </Label>
                <ContainerPickerView style={defaultStyle.viewPicker}>
                  <Picker
                    style={defaultStyle.text}
                    itemStyle={defaultStyle.itemStyle}
                    enabled={!refreshing}
                    label="periodo"
                    selectedValue={periodo}
                    onValueChange={(itemValue) => setPeriodo(itemValue)}
                  >
                    {PeriodList.map(({ label, value }) => <Picker.Item color={pickerItemColor} key={`periodo-${label}-${value}`} label={label.toUpperCase()} value={value} />)}
                  </Picker>
                </ContainerPickerView>
              </View>
              <View>
                <Text style={[styles.textFilter, defaultStyle.text]}>
                  Data inicial
                </Text>
              </View>
              <View>
                <AlphaDateInput onChange={(_, value) => setDateInicio(value)} value={dateInicio} />
              </View>
              <View>
                <Text style={[styles.textFilter, defaultStyle.text]}>
                  Data final
                </Text>
              </View>
              <View>
                <AlphaDateInput onChange={(_, value) => setDateFim(value)} value={dateFim} />
              </View>
            </View>
              : <View></View>
            }
          </FormFilter>
        </TouchableWithoutFeedback>
      </ScrollView1>
    </KeyboardAvoidingView>
  }

  useFocusEffect(useCallback(() => {
    setFilterOpen(false)
    AsyncStorageSync({ sync })
  }, [setFilterOpen, sync]))

  useFocusEffect(useCallback(() => {
    FinanceiroDAO.GetCount().then(contagem => setTotalGeral(contagem))
  }, []))

  useEffect(() => {
    setRefreshing(true)
    setOffset(0)
    setListagemCompleta(false)

    // Variáveis de data formatada no parâmetro ideal para filtragem
    const dateEntrada = moment(dateInicio).format('YYYY-MM-DDTHH:mm:ss')
    const dateSaida = moment(dateFim).format('YYYY-MM-DDTHH:mm:ss')

    FinanceiroDAO.Filter({ filtros }, dateEntrada, dateSaida, 0).then(r => setListFinanceiro(r)).finally(() => setRefreshing(false))
  }, [dateInicio, dateFim, filtros])

  const atualizarListagemOffset = useCallback(() => {
    if (!offset || listagemCompleta) return

    setRefreshing(true)

    // Variáveis de data formatada no parâmetro ideal para filtragem
    const dateEntrada = moment(dateInicio).format('YYYY-MM-DDTHH:mm:ss')
    const dateSaida = moment(dateFim).format('YYYY-MM-DDTHH:mm:ss')

    FinanceiroDAO.Filter({ filtros }, dateEntrada, dateSaida, offset).then(r => {
      if (!r.length) {
        setListagemCompleta(r)
        return
      }
      setListFinanceiro(removeDuplicatesFromList([...listFinanceiro, ...r], 'id'))
    }).finally(() => setRefreshing(false))
  }, [dateFim, dateInicio, filtros, listFinanceiro, listagemCompleta, offset])

  useEffect(() => {
    atualizarListagemOffset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset])

  useEffect(() => {
    const a = getPeriodValues(periodo)

    setDateInicio(a[0])
    setDateFim(a[1])
  }, [periodo])

  return (
    <SafeAreaView style={[{ flex: 1 }, defaultStyle.background1]}>
      {filterOpen && formFilters()}
      <Text style={[styles.textDateImportCard, defaultStyle.text]}>
        Total geral: {totalGeral} | Itens exibidos: {listFinanceiro.length}
      </Text>
      <FlatList
        refreshing={refreshing}
        onEndReached={() => {
          if (!listagemCompleta) setOffset(offset + 10)
        }}
        onEndReachedThreshold={0.01}
        style={defaultStyle.background1}
        data={listFinanceiro}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${index}-${item.id}-${item.idAlphaExpress}`}
        ItemSeparatorComponent={() => <Divider style={[defaultStyle.lineDivider]} />}
        ListEmptyComponent={() => <Text style={[styles.textNotItems, defaultStyle.text]}>{'Não há itens para exibir'}</Text>}
        ListFooterComponent={() => refreshing && (
          <View>
            <Text style={defaultStyle.text}>Carregando itens...</Text>
          </View>
        )}
        onScrollBeginDrag={() => setFilterOpen(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  textDateImportCard: {
    padding: 5,
    fontSize: 18,
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#0A7AC3'
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  rowRemoveFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  textBold: {
    fontWeight: 'bold',
    fontSize: 18
  },
  textRazao: {
    fontWeight: 'bold',
    fontSize: 17
  },
  textPagamento: {
    fontWeight: 'bold',
    fontSize: 12
  },
  textDate: {
    flexDirection: 'row',
    fontWeight: 'normal'
  },
  pagoSuccess: {
    padding: 0,
    margin: 0,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 5,
    backgroundColor: '#3BB54A',
    borderColor: '#3BB54A'
  },
  abertoAlert: {
    padding: 0,
    margin: 0,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 5,
    backgroundColor: '#F9A146',
    borderColor: '#F9A146'
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
    paddingTop: 5
  },
  paddingBottom: 5,
  filters: {
    padding: 10
  },
  textNotItems: {
    fontSize: 18
  }
})

export default FinanceiroScreen
