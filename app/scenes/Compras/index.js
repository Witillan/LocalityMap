import { AntDesign, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Picker } from '@react-native-picker/picker'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import moment from 'moment'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { Divider } from 'react-native-elements'
import { sincronizacaoGeral } from '../../api'
import FloatingButton from '../../components/Buttons/FloatingButton'
import FloatingButtonScroll from '../../components/Buttons/FloatingButtonScroll'
import TouchableOpacityButtonResetFilter from '../../components/Buttons/TouchableOpacityButtonResetFilter'
import AlphaDateInput from '../../components/Date/AlphaDateInput'
import AlertButtons from '../../components/Modal/AlertButtons'
import { AsyncStorageSync, ModalBasic } from '../../components/Modal/ModalLoading'
import { AuthContext, CompraContext, SyncContext } from '../../components/navigation/contexts'
import {
  ContainerPicker,
  ContainerPickerView,
  FlatList1,
  FormFilter,
  Input,
  Label,
  Label18,
  Label18Bold,
  LabelBold,
  ListItemButtom3,
  SafeAreaView1,
  ScrollView1,
  useDefaultStyleSheet
} from '../../components/style'
import CompraDao from '../../db/CompraDao'
import FormaPagamentoDAO from '../../db/FormaPagamentoDao'
import { useDebounce } from '../../hooks/useDebounce'
import { checkConnection } from '../../hooks/useNetworkStatus'
import { getPeriodValues, PeriodList } from '../../util/date'
import { createUUID } from '../../util/guid'
import { NumberUtil } from '../../util/number'
import onShare from './impresso'

const Item = ({ item: { id, idAlphaExpress, nomeRazao, apelido, tempId, dataEHora, dataCriacao, formaPagamento, total, fechado, numeroCompra }, navigation, empresa, userInfo, update, setUpdate }) => {
  const [loading, setLoading] = useState('')
  const [message, setMessage] = useState('')
  const [abrirButtons, setAbrirButtons] = useState(false)
  const [deletar, setDeletar] = useState(false)

  const gerarPdf = () => {
    setLoading(true)
    setMessage('Gerando PDF...')
    onShare(tempId, empresa, userInfo)
      .catch(err => Alert.alert('Erro', err.message))
      .finally(() => setLoading(false))
  }

  const duplicarCompra = async () => {
    CompraDao.GetOne(tempId).then(compra => {
      setLoading(true)
      setMessage('Duplicando Compra...')
      const dataCriacao = moment.utc(new Date()).format()
      const dataEHora = moment.utc(new Date()).format()

      compra.tempId = createUUID()
      compra.id = null
      compra.idAlphaExpress = 0
      compra.fechado = 0
      compra.sincronizado = 0
      compra.dataEHora = dataEHora
      compra.dataCriacao = dataCriacao
      compra.dataAlteracao = null
      compra.numeroCompra = 0

      compra.itens = compra.itens.map(item => ({
        ...item,
        id: null,
        idAlphaExpress: 0,
        tempId: createUUID(),
        tempCompraId: compra.tempId,
        compraId: null,
        empresaId: compra.empresaId
      }))

      const salvar = async () => {
        try {
          await CompraDao.Save(compra)
          navigation.navigate('NewCompra', { tempIdParam: compra.tempId, id: null })
        } catch (error) {
          Alert.alert('Erro', error)
        } finally {
          setLoading(false)
        }
      }

      salvar()
    }).catch(err => Alert.alert('Erro', err.message))
  }

  const removerOrcamento = async () => {
    if (fechado === 1) {
      Alert.alert('Não permitido', 'Você não pode deletar este compra, pois ele ta está fechado')
    } else {
      setDeletar(true)
    }
  }

  const confirmarDeleteOrcamento = async () => {
    await CompraDao.RemoveByOneTempId(tempId)
    setUpdate(!update)
  }

  return (
    <ListItemButtom3
      onPress={() => navigation.navigate('NewCompra', { tempIdParam: tempId, id })}
      onLongPress={() => setAbrirButtons(true)}>
      <View>
        <View style={styles.view}>
          <Label style={styles.textDate}>
            {moment(dataEHora).format('DD/MM/YYYY')}
          </Label>
          <Label style={styles.textTime}>
            {moment(dataEHora).format('HH:mm')}
          </Label>
        </View>
        <View style={styles.row}>
          <LabelBold style={styles.text17}>
            {nomeRazao.toUpperCase()}
          </LabelBold>
        </View>
        <View>
          <Label>{apelido.toUpperCase() || nomeRazao.toUpperCase()}</Label>
          {!!numeroCompra && <View style={styles.viewDateAndTime}>
            <Label>
              Compra:
            </Label>
            <Label style={{ paddingLeft: 2 }}>
              {numeroCompra}
            </Label>
          </View>}
          <LabelBold style={styles.text12}>{formaPagamento.toUpperCase()}</LabelBold>
        </View>
        <View style={[styles.row, { paddingBottom: 15 }]}>
          <LabelBold style={styles.text17}>{NumberUtil.toDisplayNumber(total, 'R$', true)}</LabelBold>
          {fechado === 1 ? (id && idAlphaExpress ? (
            <View style={[styles.view, styles.badge, { backgroundColor: 'green' }]}>
              <LabelBold style={styles.textStatus}>
                Sincronizado no Alpha
              </LabelBold>
              <Ionicons name="checkmark-circle-outline" size={20} color="white" />
            </View>
          ) : (
            id && !idAlphaExpress
              ? <View style={[styles.view, styles.badge, { backgroundColor: '#0A7AC3' }]}>
                <LabelBold style={styles.textStatus}>
                  Sincronizado na Web
                </LabelBold>
                <Ionicons name="checkmark-circle-outline" size={20} color="white" />
              </View> : (
                !id && !idAlphaExpress && (
                  <View style={[styles.view, styles.badge, { backgroundColor: '#F9A146' }]}>
                    <LabelBold style={styles.textStatus}>
                      Pendente
                    </LabelBold>
                    <Feather name="loader" size={20} color="white" />
                  </View>
                )
              )
          )) : (
            <View style={[styles.view, styles.badge, { backgroundColor: '#FFFFFF' }]}>
              <LabelBold style={styles.textOrcamento}>
                Orçamento
              </LabelBold>
              <MaterialIcons name="monetization-on" size={20} color="#F9A146" />
            </View>
          )}
        </View>
        <ModalBasic
          loading={loading}
          message={message}
        />
        <AlertButtons
          visible={abrirButtons}
          title={'Compra'}
          subTitle={'O que deseja fazer com esse compra?'}
          buttons={[
            {
              label: 'Gerar PDF',
              onPress: (r) => {
                gerarPdf()
                setAbrirButtons(r)
              }
            },
            {
              label: 'Duplicar',
              onPress: (r) => {
                duplicarCompra()
                setAbrirButtons(r)
              }
            },
            {
              label: 'Deletar',
              onPress: (r) => {
                removerOrcamento()
                setAbrirButtons(r)
              }
            },
            {
              label: 'Cancelar',
              onPress: (r) => setAbrirButtons(r)
            }
          ]}
        />
        <AlertButtons
          visible={deletar}
          title={'Deletar orçamento'}
          subTitle={'Deseja mesmo deletar este orçamento?'}
          buttons={[
            {
              label: 'Confirmar',
              onPress: (r) => {
                confirmarDeleteOrcamento()
                setDeletar(r)
              }
            },
            { label: 'Cancelar', onPress: (r) => setDeletar(r) }
          ]}
        />
      </View>
    </ListItemButtom3>
  )
}

BackgroundFetch.setMinimumIntervalAsync(5)

const SINCRONIZACAO_TASK_NAME = 'sincronizacao-geral'

TaskManager.defineTask(SINCRONIZACAO_TASK_NAME, async () => {
  const authorization = await AsyncStorage.getItem('Authorization')

  if ((await checkConnection()) && authorization) {
    await sincronizacaoGeral({ sincronizarCidades: false })
    return BackgroundFetch.Result.NewData
  }

  return BackgroundFetch.Result.NoData
})

const CompraScreen = () => {
  const screen = Dimensions.get('window')
  const { defaultStyle, placeholderTextColor, pickerItemColor, textPrimaryColor } = useDefaultStyleSheet()
  const { sync } = useContext(SyncContext)
  const { filterOpen, setFilterOpen } = useContext(CompraContext)
  const { empresa, userInfo } = useContext(AuthContext)

  const navigation = useNavigation()
  const [offset, setOffset] = useState(0)
  const [listCompra, setListCompra] = useState([])
  const [totalGeral, setTotalGeral] = useState(0)

  const [status, setStatus] = useState('')
  const [formaPagamentoId, setFormaPagamentoId] = useState('')
  const [nomeRazao, setNomeRazao] = useState('')
  const [apelido, setApelido] = useState('')

  const debouncedNomeRazao = useDebounce(nomeRazao, 200)
  const debouncedApelido = useDebounce(apelido, 200)

  // Controladores de periodo
  const [periodo, setPeriodo] = useState(2)
  const [dateInicio, setDateInicio] = useState(getPeriodValues(0)[0])
  const [dateFim, setDateFim] = useState(getPeriodValues(0)[1])

  // Controladores de estado do ordenador
  const [checke1, setChecke1] = useState(null)
  const [checke2, setChecke2] = useState(null)
  const [checke3, setChecke3] = useState(null)

  // Controlador de estado para atulizar a flatList após remover um orçamento
  const [update, setUpdate] = useState(false)

  const scrollRef = useRef(null)

  const [index, setIndex] = useState(false)

  const allChecks = useMemo(() => ({ checke1, checke2, checke3 }), [checke1, checke2, checke3])

  const handleChangeChecke1 = () => {
    setChecke1(checke1 === 'DESC' ? 'ASC' : 'DESC')
    setChecke2(null)
    setChecke3(null)
  }

  const handleChangeChecke2 = () => {
    setChecke2(checke2 === 'DESC' ? 'ASC' : 'DESC')
    setChecke1(null)
    setChecke3(null)
  }

  const handleChangeChecke3 = () => {
    setChecke3(checke3 === 'DESC' ? 'ASC' : 'DESC')
    setChecke1(null)
    setChecke2(null)
  }

  const [listagemCompleta, setListagemCompleta] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const filtros = useMemo(() => ({
    nomeRazao: debouncedNomeRazao,
    apelido: debouncedApelido,
    periodo,
    formaPagamentoId,
    status
  }), [debouncedApelido, formaPagamentoId, debouncedNomeRazao, periodo, status])

  const [formasPagamento, setFormasPagamento] = useState([])

  const renderItem = useCallback(({ item }) => <Item item={item} navigation={navigation} empresa={empresa} userInfo={userInfo} update={update} setUpdate={setUpdate} />, [empresa, navigation, update, userInfo])

  const initBackgroundFetch = async () => {
    const registered = await TaskManager.isTaskRegisteredAsync(SINCRONIZACAO_TASK_NAME)

    const backgroundFetchStatus = await BackgroundFetch.getStatusAsync()
    switch (backgroundFetchStatus) {
      case BackgroundFetch.BackgroundFetchStatus.Restricted:
        return

      case BackgroundFetch.BackgroundFetchStatus.Denied:
        return

      default:
        if (!registered) {
          await BackgroundFetch.registerTaskAsync(SINCRONIZACAO_TASK_NAME, {
            minimumInterval: 15,
            startOnBoot: true,
            stopOnTerminate: false
          })
        }
        break
    }
  }

  const resetFilters = () => {
    setNomeRazao('')
    setApelido('')
    setFormaPagamentoId('')
    setStatus('')
    setPeriodo(2)
    setDateInicio(getPeriodValues(0)[0])
    setDateFim(getPeriodValues(0)[1])
    setChecke1(null)
    setChecke2(null)
    setChecke3(null)
  }

  useEffect(() => {
    const a = getPeriodValues(periodo)

    setDateInicio(a[0])
    setDateFim(a[1])
  }, [periodo])

  const formFilters = () => {
    return (
      <KeyboardAvoidingView
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
                <Input onChangeText={setNomeRazao} value={nomeRazao} maxLength={40} placeholder="Ex: Alpha Software" placeholderTextColor={placeholderTextColor} ></Input>
              </View>
              <View>
                <Label18 style={styles.textFilter}>
                  Nome Fantasia
                </Label18>
                <Input onChangeText={setApelido} value={apelido} maxLength={40} placeholder="Ex: Alpha Software" placeholderTextColor={placeholderTextColor} ></Input>
              </View>
              <View>
                <Label18>
                  Forma de Pagamento
                </Label18>
                <ContainerPickerView>
                  <Picker
                    placeholderTextColor={placeholderTextColor}
                    itemStyle={defaultStyle.itemStyle}
                    style={[defaultStyle.text]}
                    label={'formaPagamento'}
                    selectedValue={formaPagamentoId}
                    onValueChange={(itemValue) => setFormaPagamentoId(itemValue)}
                  >
                    <Picker.Item label="Todas as opções" value="" />
                    {formasPagamento.map(({ id, nome }) => <Picker.Item color={pickerItemColor} key={`formas-${nome}-${id}`} label={nome.toUpperCase()} value={id} />)}
                  </Picker>
                </ContainerPickerView>
              </View>
              <View>
                <Label18 style={styles.textFilter}>
                  Status
                </Label18>
                <View style={styles.rowRemoveFilter}>
                  <ContainerPickerView style={{ width: '85%' }}>
                    <Picker
                      placeholderTextColor={placeholderTextColor}
                      style={defaultStyle.text}
                      itemStyle={defaultStyle.itemStyle}
                      label="Status"
                      selectedValue={status}
                      onValueChange={(itemValue) => setStatus(itemValue)}
                    >
                      <Picker.Item color={pickerItemColor} label="Todas as opções" value="" />
                      <Picker.Item color={pickerItemColor} label="Pendente" value="Pendente" />
                      <Picker.Item color={pickerItemColor} label="Orçamento" value="Orcamento" />
                      <Picker.Item color={pickerItemColor} label="Sincronizado na Web" value="Sincronizado na Web" />
                      <Picker.Item color={pickerItemColor} label="Sincronizado no Alpha" value="Sincronizado no Alpha" />
                    </Picker>
                  </ContainerPickerView>
                  <View style={{ paddingLeft: 5 }}>
                    <TouchableOpacityButtonResetFilter
                      onSubmit={resetFilters}
                    />
                  </View>
                </View>
              </View>
              <View>
                <Label18 style={styles.textFilter}>
                  Período
                </Label18>
                <ContainerPickerView>
                  <Picker
                    style={defaultStyle.text}
                    itemStyle={defaultStyle.itemStyle}
                    enabled={!refreshing}
                    label="Periodo"
                    selectedValue={periodo}
                    onValueChange={(itemValue) => setPeriodo(itemValue)}
                  >
                    {PeriodList.map(({ label, value }) => <Picker.Item color={pickerItemColor} key={`${value}-item-${label}-periodo`} label={label.toUpperCase()} value={value} />)}
                  </Picker>
                </ContainerPickerView>
              </View>
              <View>
                <Label18>
                  Data inicial
                </Label18>
              </View>
              <View>
                <AlphaDateInput onChange={(_, value) => setDateInicio(value)} value={dateInicio} />
              </View>
              <View>
                <Label18>
                  Data final
                </Label18>
              </View>
              <View>
                <AlphaDateInput onChange={(_, value) => setDateFim(value)} value={dateFim} />
              </View>
              <View>
                <Label18>
                  Ordenar por
                </Label18>
              </View>
              <View style={{ flex: 1, justifyContent: 'space-around', flexDirection: 'row', alignItems: 'center', paddingVertical: 20 }}>
                <ContainerPicker style={[styles.order, { paddingHorizontal: 5, height: 30 }]} onPress={() => handleChangeChecke1()}>
                  <Label>{'Data e Hora  '}</Label>
                  {checke1 === 'DESC' ? <AntDesign name="arrowup" size={24} color={textPrimaryColor} /> : <AntDesign name="arrowdown" size={24} color={textPrimaryColor} />}
                </ContainerPicker>
                <ContainerPicker style={[styles.order, { paddingHorizontal: 5, height: 30 }]} onPress={() => handleChangeChecke2()}>
                  <Label>{'Nome Fantasia  '}</Label>
                  {checke2 === 'DESC' ? <AntDesign name="arrowup" size={24} color={textPrimaryColor} /> : <AntDesign name="arrowdown" size={24} color={textPrimaryColor} />}
                </ContainerPicker>
                <ContainerPicker style={[styles.order, { paddingHorizontal: 5, height: 30 }]} onPress={() => handleChangeChecke3()}>
                  <Label>{'Razão Social  '}</Label>
                  {checke3 === 'DESC' ? <AntDesign name="arrowup" size={24} color={textPrimaryColor} /> : <AntDesign name="arrowdown" size={24} color={textPrimaryColor} />}
                </ContainerPicker>
              </View>
            </FormFilter>
          </TouchableWithoutFeedback>
        </ScrollView1>
      </KeyboardAvoidingView>
    )
  }

  const rolarTop = () => {
    if (index === true) {
      scrollRef.current.scrollToIndex({ animated: true, index: 0 })
      setIndex(false)
    };
  }

  useFocusEffect(useCallback(() => {
    setFilterOpen(false)
    AsyncStorageSync({ sync })
  }, [setFilterOpen, sync]))

  useFocusEffect(useCallback(() => {
    initBackgroundFetch()
    CompraDao.GetCount().then(contagem => setTotalGeral(contagem))
    FormaPagamentoDAO.GetList().then(r => setFormasPagamento(r))

    // Variáveis de data formatada no parâmetro ideal para filtragem
    const dateEntrada = moment(dateInicio).format('YYYY-MM-DDTHH:mm:ss')
    const dateSaida = moment(dateFim).format('YYYY-MM-DDTHH:mm:ss')

    setRefreshing(true)
    setOffset(0)
    setListagemCompleta(false)

    CompraDao.FiltroCompras({ filtros }, dateEntrada, dateSaida, { allChecks }).then(setListCompra).finally(() => setRefreshing(false))
  }, [allChecks, dateFim, dateInicio, filtros]))

  useFocusEffect(useCallback(() => {
    setRefreshing(true)
    setOffset(0)
    setListagemCompleta(false)

    // Variáveis de data formatada no parâmetro ideal para filtragem
    const dateEntrada = moment(dateInicio).format('YYYY-MM-DDTHH:mm:ss')
    const dateSaida = moment(dateFim).format('YYYY-MM-DDTHH:mm:ss')

    CompraDao.FiltroCompras({ filtros }, dateEntrada, dateSaida, { allChecks }, 0)
      .then(r => { setListCompra(r) })
      .finally(() => setRefreshing(false))
  }, [dateInicio, dateFim, filtros, allChecks]))

  const atualizarListagemOffset = useCallback(() => {
    if (!offset || listagemCompleta) return
    setRefreshing(true)

    // Variáveis de data formatada no parâmetro ideal para filtragem
    const dateEntrada = moment(dateInicio).format('YYYY-MM-DDTHH:mm:ss')
    const dateSaida = moment(dateFim).format('YYYY-MM-DDTHH:mm:ss')

    CompraDao.FiltroCompras({ filtros }, dateEntrada, dateSaida, { allChecks }, offset).then(r => {
      if (!r.length) {
        setListagemCompleta(true)
        return
      }
      setListCompra([...listCompra, ...r])
    }).finally(() => setRefreshing(false))
  }, [allChecks, dateFim, dateInicio, filtros, listCompra, listagemCompleta, offset])

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

  return (
    <SafeAreaView1>
      {filterOpen && formFilters()}
      <Label18Bold style={styles.textDateImportCard}>
        Total geral: {totalGeral} | Itens exibidos: {listCompra.length}
      </Label18Bold>
      <FlatList1
        ref={scrollRef}
        refreshing={refreshing}
        onEndReached={() => {
          if (!listagemCompleta) setOffset(offset + 10)
        }}
        onEndReachedThreshold={0.01}
        data={listCompra}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${index}-${item.tempId}`}
        ListEmptyComponent={() => <Label18>{'Não há itens para exibir'}</Label18>}
        ListFooterComponent={() => refreshing && (
          <View>
            <Label>Carregando compras...</Label>
          </View>
        )}
        onScrollBeginDrag={() => {
          setIndex(true)
          setFilterOpen(false)

          setTimeout(() => {
            setIndex(false)
          }, 60000)
        }}
        refreshControl={<RefreshControl
          colors={['#0A7AC3']}
          refreshing={refreshing}
          onRefresh={refresh}
        />}
        ItemSeparatorComponent={() => <Divider style={defaultStyle.lineDivider} />}
      />
      <FloatingButton
        icon="plus"
        style={styles.floatinBtn}
        onPress={() => navigation.navigate('NewCompra')}
      />
      {index && (
        <FloatingButtonScroll
          icon="arrow-circle-up"
          style={styles.floatinBtnScroll}
          onPress={() => rolarTop()}
        />
      )}
    </SafeAreaView1>
  )
}

const styles = StyleSheet.create({
  textDateImportCard: {
    padding: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#0A7AC3'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  rowRemoveFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  text17: {
    fontSize: 17
  },
  text12: {
    fontSize: 12
  },
  view: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  badge: {
    padding: 2,
    borderRadius: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textStatus: {
    paddingRight: 5,
    color: 'white'
  },
  textOrcamento: {
    paddingRight: 5,
    color: '#F9A146'
  },
  textDate: {
    paddingRight: 5,
    fontSize: 13
  },
  textTime: {
    fontSize: 13
  },
  viewDateAndTime: {
    flexDirection: 'row'
  },
  lineDivider: {
    marginVertical: 2,
    backgroundColor: 'transparent'
  },
  floatinBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10
  },
  floatinBtnScroll: {
    position: 'absolute',
    bottom: 90,
    right: 15
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
    padding: 10,
    backgroundColor: 'white'
  },
  order: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 1
  }
})

export default CompraScreen
