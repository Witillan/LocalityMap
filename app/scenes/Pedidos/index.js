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
import { AuthContext, PedidoContext, SyncContext } from '../../components/navigation/contexts'
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
import PedidoDao from '../../db/PedidoDao'
import { useConfig } from '../../hooks/useConfig'
import { useDebounce } from '../../hooks/useDebounce'
import { checkConnection } from '../../hooks/useNetworkStatus'
import { removeDuplicatesFromList } from '../../util/collections'
import { getPeriodLabel, getPeriodValues, PeriodList } from '../../util/date'
import { createUUID } from '../../util/guid'
import { NumberUtil } from '../../util/number'
import onShare from './impresso'

const Item = ({ config, item: { id, idAlphaExpress, nomeRazao, apelido, tempId, dataEHora, formaPagamento, total, revertido, fechado, numeroPedido }, navigation, empresa, userInfo, update, setUpdate, onDelete }) => {
  const [loading, setLoading] = useState('')
  const [message, setMessage] = useState('')
  const [abrirButtons, setAbrirButtons] = useState(false)
  const [deletar, setDeletar] = useState(false)

  const gerarPdf = useCallback(() => {
    if (config.bloquearImpressaoPdf) {
      alert('A impressão de PDF foi bloqueada pelo administrador')
      return
    }
    setLoading(true)
    setMessage('Gerando PDF...')
    onShare(tempId, empresa, userInfo)
      .catch(err => Alert.alert('Erro', err.message))
      .finally(() => setLoading(false))
  }, [config.bloquearImpressaoPdf, empresa, tempId, userInfo])

  const duplicarPedido = useCallback(async () => {
    try {
      const pedido = await PedidoDao.GetOne(tempId)

      setLoading(true)
      setMessage('Duplicando Pedido...')
      const dataCriacao = moment.utc(new Date()).format()
      const dataEHora = moment.utc(new Date()).format()

      pedido.tempId = createUUID()
      pedido.id = null
      pedido.idAlphaExpress = 0
      pedido.fechado = 0
      pedido.sincronizado = 0
      pedido.dataEHora = dataEHora
      pedido.dataCriacao = dataCriacao
      pedido.dataAlteracao = null
      pedido.numeroPedido = 0

      pedido.itens = pedido.itens.map(item => ({
        ...item,
        id: null,
        idAlphaExpress: 0,
        tempId: createUUID(),
        tempPedidoId: pedido.tempId,
        pedidoId: null,
        empresaId: pedido.empresaId
      }))

      await PedidoDao.Save(pedido)
      navigation.navigate('NewPedido', { tempIdParam: pedido.tempId, id: null })
    } catch (error) {
      Alert.alert('Erro', error)
    } finally {
      setLoading(false)
    }
  }, [navigation, tempId])

  const removerOrcamento = useCallback(async () => {
    if (fechado === 1) {
      Alert.alert('Não permitido', 'Você não pode deletar este pedido, pois ele ta está fechado')
    } else {
      setDeletar(true)
    }
  }, [fechado])

  const confirmarDeleteOrcamento = useCallback(async () => {
    await PedidoDao.RemoveByOneTempId(tempId)
    setUpdate(!update)
    onDelete()
  }, [onDelete, setUpdate, tempId, update])

  const renderBadge = () => {
    if (revertido === '1') {
      return <View style={[styles.view, styles.badge, { backgroundColor: '#FFFFFF' }]}>
        <LabelBold style={styles.textRevertido}>
          Revertido
        </LabelBold>
        <MaterialIcons name="undo" size={20} color="#720b98" />
      </View>
    }

    if (fechado !== 1) {
      return <View style={[styles.view, styles.badge, { backgroundColor: '#FFFFFF' }]}>
        <LabelBold style={styles.textOrcamento}>
          Orçamento
        </LabelBold>
        <MaterialIcons name="monetization-on" size={20} color="#F9A146" />
      </View>
    }

    if (id && idAlphaExpress) {
      return <View style={[styles.view, styles.badge, { backgroundColor: 'green' }]}>
        <LabelBold style={styles.textStatus}>
          Sincronizado no Alpha
        </LabelBold>
        <Ionicons name="checkmark-circle-outline" size={20} color="white" />
      </View>
    }

    if (id && !idAlphaExpress) {
      return <View style={[styles.view, styles.badge, { backgroundColor: '#0A7AC3' }]}>
        <LabelBold style={styles.textStatus}>
          Sincronizado na Web
        </LabelBold>
        <Ionicons name="checkmark-circle-outline" size={20} color="white" />
      </View>
    }

    return <View style={[styles.view, styles.badge, { backgroundColor: '#F9A146' }]}>
      <LabelBold style={styles.textStatus}>
        Pendente
      </LabelBold>
      <Feather name="loader" size={20} color="white" />
    </View>
  }

  return (
    <ListItemButtom3 onPress={() => navigation.navigate('NewPedido', { tempIdParam: tempId, id })} onLongPress={() => setAbrirButtons(true)}>
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
          {!!numeroPedido && <View style={styles.viewDateAndTime}>
            <Label>
              Pedido:
            </Label>
            <Label style={{ paddingLeft: 2 }}>
              {numeroPedido}
            </Label>
          </View>}
          <LabelBold style={styles.text12}>{formaPagamento.toUpperCase()}</LabelBold>
        </View>
        <View style={[styles.row, { paddingBottom: 15 }]}>
          <LabelBold style={styles.text17}>{NumberUtil.toDisplayNumber(total, 'R$', true)}</LabelBold>
          {renderBadge()}
        </View>
        <ModalBasic loading={loading} message={message} />
        <AlertButtons
          visible={abrirButtons}
          title="Pedido"
          subTitle="O que deseja fazer com esse pedido?"
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
                duplicarPedido()
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
          title="Deletar orçamento"
          subTitle="Deseja mesmo deletar este orçamento?"
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

  if (await checkConnection() && authorization) {
    await sincronizacaoGeral({ sincronizarCidades: false })
    return BackgroundFetch.BackgroundFetchResult.NewData
  }

  return BackgroundFetch.BackgroundFetchResult.NoData
})

const PedidoScreen = () => {
  const screen = Dimensions.get('window')
  const { defaultStyle, placeholderTextColor, pickerItemColor, textPrimaryColor } = useDefaultStyleSheet()
  const { sync, loading: jaSincronizado } = useContext(SyncContext)
  const { filterOpen, setFilterOpen } = useContext(PedidoContext)
  const { empresa, userInfo } = useContext(AuthContext)
  const [config, refreshConfig] = useConfig()
  const navigation = useNavigation()
  const [offset, setOffset] = useState(0)
  const [listPedido, setListPedido] = useState([])
  const [totalGeral, setTotalGeral] = useState(0)

  const [status, setStatus] = useState('')
  const [formaPagamentoId, setFormaPagamentoId] = useState('')
  const [cliente, setCliente] = useState('')

  const debouncedCliente = useDebounce(cliente, 200)

  // Controladores de periodo
  const [periodo, setPeriodo] = useState(4)
  const [dateInicio, setDateInicio] = useState(getPeriodValues(4)[0])
  const [dateFim, setDateFim] = useState(getPeriodValues(4)[1])

  // Controladores de estado do ordenador
  const [checke1, setChecke1] = useState(null)
  const [checke2, setChecke2] = useState(null)
  const [checke3, setChecke3] = useState(null)

  // Controlador de estado para atulizar a flatList após remover um orçamento
  const [update, setUpdate] = useState(false)

  const scrollRef = useRef(null)

  const [index, setIndex] = useState(false)
  const [listagemCompleta, setListagemCompleta] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const allChecks = useMemo(() => ({ checke1, checke2, checke3 }), [checke1, checke2, checke3])
  const handleChangeChecke1 = useCallback(() => {
    setChecke1(checke1 === 'DESC' ? 'ASC' : 'DESC')
    setChecke2(null)
    setChecke3(null)
  }, [checke1])

  const handleChangeChecke2 = useCallback(() => {
    setChecke2(checke2 === 'DESC' ? 'ASC' : 'DESC')
    setChecke1(null)
    setChecke3(null)
  }, [checke2])

  const handleChangeChecke3 = useCallback(() => {
    setChecke3(checke3 === 'DESC' ? 'ASC' : 'DESC')
    setChecke1(null)
    setChecke2(null)
  }, [checke3])

  const filtros = useMemo(() => ({ cliente: debouncedCliente, periodo, formaPagamentoId, status }), [debouncedCliente, formaPagamentoId, periodo, status])

  const execFiltro = useCallback((offset = 0) => {
    // Variáveis de data formatada no parâmetro ideal para filtragem
    const dateEntrada = moment(dateInicio).format('YYYY-MM-DDTHH:mm:ss')
    const dateSaida = moment(dateFim).format('YYYY-MM-DDTHH:mm:ss')

    PedidoDao.FiltroPedidos({ filtros }, dateEntrada, dateSaida, { allChecks }, offset)
      .then(r => {
        if (offset === 0) {
          setListPedido(r)
        } else {
          setListPedido(removeDuplicatesFromList([...listPedido, ...r], 'tempId'))
        }
      })
      .finally(() => setRefreshing(false))
    PedidoDao.GetCount({ ...filtros, dateEntrada, dateSaida }).then(contagem => setTotalGeral(contagem))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allChecks, dateFim, dateInicio, filtros, listPedido])

  const renderItem = useCallback(({ item }) => <Item onDelete={execFiltro} config={config} item={item} navigation={navigation} empresa={empresa} userInfo={userInfo} update={update} setUpdate={setUpdate} />, [config, empresa, execFiltro, navigation, update, userInfo])

  const initBackgroundFetch = useCallback(async () => {
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
            minimumInterval: 5,
            startOnBoot: true,
            stopOnTerminate: false
          })
        }
        break
    }
  }, [])

  const resetFilters = useCallback(() => {
    setCliente('')
    setFormaPagamentoId('')
    setStatus('')
    setPeriodo(2)
    setDateInicio(getPeriodValues(0)[0])
    setDateFim(getPeriodValues(0)[1])
    setChecke1(null)
    setChecke2(null)
    setChecke3(null)
  }, [])

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
                  Cliente
                </Label18>
                <View style={styles.rowRemoveFilter}>
                  <Input style={{ width: '85%' }} onChangeText={setCliente} value={cliente} maxLength={40} placeholder="Ex: Alpha Software" placeholderTextColor={placeholderTextColor} />
                  <View style={{ paddingLeft: 5 }}>
                    <TouchableOpacityButtonResetFilter onSubmit={resetFilters} />
                  </View>
                </View>
              </View>
              <View>
                <Label18 style={styles.textFilter}>
                  Status
                </Label18>
                <View>
                  <ContainerPickerView>
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
                <AlphaDateInput hideLabels={true} onChange={(_, value) => setDateInicio(value)} value={dateInicio} />
              </View>
              <View>
                <Label18>
                  Data final
                </Label18>
              </View>
              <View>
                <AlphaDateInput hideLabels={true} onChange={(_, value) => setDateFim(value)} value={dateFim} />
              </View>
              <View>
                <Label18>
                  Ordenar por
                </Label18>
              </View>
              <View style={{ flex: 1, justifyContent: 'space-around', flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }}>
                <ContainerPicker style={[styles.order, { paddingHorizontal: 5, height: 30 }]} onPress={handleChangeChecke1}>
                  <Label>{'Data e Hora  '}</Label>
                  {checke1 === 'DESC' ? <AntDesign name="arrowup" size={24} color={textPrimaryColor} /> : <AntDesign name="arrowdown" size={24} color={textPrimaryColor} />}
                </ContainerPicker>
                <ContainerPicker style={[styles.order, { paddingHorizontal: 5, height: 30 }]} onPress={handleChangeChecke2}>
                  <Label>{'Nome Fantasia  '}</Label>
                  {checke2 === 'DESC' ? <AntDesign name="arrowup" size={24} color={textPrimaryColor} /> : <AntDesign name="arrowdown" size={24} color={textPrimaryColor} />}
                </ContainerPicker>
                <ContainerPicker style={[styles.order, { paddingHorizontal: 5, height: 30 }]} onPress={handleChangeChecke3}>
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

  const rolarTop = useCallback(() => {
    if (index) {
      scrollRef.current.scrollToIndex({ animated: true, index: 0 })
      setIndex(false)
    };
  }, [index])

  useFocusEffect(useCallback(() => {
    setFilterOpen(false)
    AsyncStorageSync({ sync })
  }, [setFilterOpen, sync]))

  useFocusEffect(useCallback(() => {
    initBackgroundFetch()
  }, [initBackgroundFetch]))

  useFocusEffect(useCallback(() => {
    refreshConfig()
    setOffset(0)
    setListagemCompleta(false)

    execFiltro(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshConfig, jaSincronizado]))

  useEffect(() => {
    if (!offset || listagemCompleta) return

    execFiltro(offset)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listagemCompleta, offset])

  useEffect(() => {
    refreshConfig()
    setOffset(0)
    setListagemCompleta(false)

    execFiltro(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros, jaSincronizado, dateInicio, dateFim])

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
        Exibindo {listPedido.length} de {totalGeral} pedidos {getPeriodLabel(periodo)}
      </Label18Bold>
      <FlatList1
        ref={scrollRef}
        refreshing={refreshing}
        onEndReached={() => {
          if (!listagemCompleta) setOffset(offset + 10)
        }}
        onEndReachedThreshold={0.01}
        data={listPedido}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${index}-${item.tempId}`}
        ListEmptyComponent={() => <Label18>Não há itens para exibir</Label18>}
        ListFooterComponent={() => refreshing && <View>
          <Label>Carregando pedidos...</Label>
        </View>}
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
        onPress={() => navigation.navigate('NewPedido')}
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
  textRevertido: {
    paddingRight: 5,
    color: '#720b98'
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

export default PedidoScreen
