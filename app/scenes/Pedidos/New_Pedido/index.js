import { AntDesign } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { format } from 'date-fns'
import * as Location from 'expo-location'
import React, { useCallback, useContext, useEffect, useRef, useState, useMemo } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { TextInputMask } from 'react-native-masked-text'
import { PedidoService } from '../../../api/pedido'
import TouchableOpacityButtonSuccess from '../../../components/Buttons/TouchableOpacityButtonSuccess'
import TouchableOpacityButtonWarning from '../../../components/Buttons/TouchableOpacityButtonWarning'
import AlphaDateInput from '../../../components/Date/AlphaDateInput'
import { ModalBasic } from '../../../components/Modal/ModalLoading'
import { AuthContext, PedidoContext } from '../../../components/navigation/contexts'
import {
  ContainerPickerView,
  FlatList2,
  Input,
  Label,
  Label18Bold,
  LabelBold,
  LabelRequired,
  LabelValidation,
  ListItem2,
  ListItem3,
  ScrollView1,
  useDefaultStyleSheet,
  ViewInput
} from '../../../components/style'
import ValidationNewPedidoSchema from '../../../components/Validation/NewPedidoValidation'
import ClienteDAO from '../../../db/ClienteDao'
import FormaPagamentoDao from '../../../db/FormaPagamentoDao'
import LogDAO from '../../../db/LogDao'
import PedidoDAO from '../../../db/PedidoDao'
import { checkConnection } from '../../../hooks/useNetworkStatus'
import { useConfig } from '../../../hooks/useConfig'
import { BackupControl } from '../../../util/backup'
import { createUUID } from '../../../util/guid'
import { NumberUtil } from '../../../util/number'
import { usePermissions } from '../../../hooks/usePermissions'

const Item = ({ item, enabled, navigation }) => {
  const casasDecimais = (item.fracionado || '').toLowerCase() === 'sim' ? 2 : 0

  return <TouchableOpacity disabled={!enabled} onPress={() => {
    navigation.navigate('Carrinho')
  }}>
    <ListItem3 style={styles.my5}>
      <View style={styles.item}>
        <LabelBold style={styles.text}>
          {item.nome}
        </LabelBold>
      </View>
      <View style={styles.item}>
        <Label style={styles.text}>
          Qtd: {NumberUtil.toDisplayNumber(item.quantidade, '', true, casasDecimais)}
        </Label>
        <Label style={styles.text}>
          Vlr. Unit.: {NumberUtil.toDisplayNumber(item.valorUnitario, 'R$', true)}
        </Label>
      </View>
      {((item.descontoPercentual > 0) && (item.descontoReal > 0)) && (
        <View style={styles.item}>
          <Label style={styles.text}>
            Desc. %: {NumberUtil.toDisplayNumber(item.descontoPercentual, '%')}
          </Label>
          <Label style={styles.text}>
            Desc.: {NumberUtil.toDisplayNumber(item.descontoReal, 'R$')}
          </Label>
        </View>
      )}
      <View style={[styles.item, { justifyContent: 'flex-end' }]}>
        <LabelBold style={styles.text}>
          Total: {NumberUtil.toDisplayNumber(item.valorTotal, 'R$')}
        </LabelBold>
      </View>
    </ListItem3>
  </TouchableOpacity>
}

const CLIENTE_INITIAL_STATE = { id: null, apelido: 'Ainda não selecionado' }
const NewPedidoScreen = () => {
  const { defaultStyle, placeholderTextColor, pickerItemColor, textPrimaryAndSecondaryColor, disabled } = useDefaultStyleSheet()
  const route = useRoute()
  const navigation = useNavigation()

  // Obtendo o id da subEmpresa e empresa vinculadas ao usuario logado
  const { subEmpresaId, empresa } = useContext(AuthContext)

  // Obtendo os itens selecionados
  const { selecionados, setSelecionados } = useContext(PedidoContext)

  // controlando campo de data e hora
  const [date, setDate] = useState(new Date())
  const [loading, setLoading] = useState(false)
  // Campos do form
  const [formaPagamentoId, setFormaPagamentoId] = useState('')
  const [sincronizado, setSincronizado] = useState(0)
  const [revertido, setRevertido] = useState(null)
  const [descontoRealStr, setDescontoRealStr] = useState('0.00')
  const [descontoPercentualStr, setDescontoPercentualStr] = useState('0.00')

  const [cliente, setCliente] = useState(CLIENTE_INITIAL_STATE)

  const [itens, setItens] = useState([])
  const [anotacoes, setAnotacoes] = useState('')

  // Validação do form
  const [validation, setValidation] = useState(null)
  const scrollRef = useRef(null)
  const descontoRealRef = useRef(null)
  const descontoPercentualRef = useRef(null)
  const [descontoReal, setDescontoReal] = useState(0)

  const { clienteParam, tempIdParam, id } = route?.params || {}
  const [formasPagamento, setFormasPagamento] = useState([])

  const [qtdItem, setQtdItem] = useState(0)

  const totalComDescontoItens = useMemo(() => NumberUtil.mapSum(itens.map(item => item.valorTotal)), [itens])
  const descontoItens = useMemo(() => NumberUtil.mapSum(itens.map(item => item.descontoReal * item.quantidade)), [itens])
  const subTotal = useMemo(() => NumberUtil.mapSum(itens.map(item => item.valorUnitario * item.quantidade)), [itens])
  const total = useMemo(() => totalComDescontoItens - descontoReal, [totalComDescontoItens, descontoReal])
  const formHabilitado = useMemo(() => !sincronizado || revertido, [revertido, sincronizado])

  const [config, refreshConfig] = useConfig()
  const [permissions, refreshPermissions] = usePermissions()

  const submit = useCallback(async (fechado) => {
    setLoading(true)
    const dataEHora = format(date, "yyyy-MM-dd'T'HH:mm")
    const tempId = tempIdParam || createUUID()

    const obj = {
      tempId,
      id,
      idAlphaExpress: 0,
      numeroPedido: 0,
      sincronizado: 0,
      clienteId: cliente?.id,
      cliente,
      anotacoes,
      dataEHora,
      formaPagamentoId,
      itens: itens.map(item => ({ ...item, tempPedidoId: tempId, tempId: item.tempId || createUUID(), empresaId: empresa.id })),
      descontoReal,
      subEmpresaId,
      fechado,
      idAparelho: createUUID(),
      empresaId: empresa.id,
      total,
      descontoPercentual: (config.aplicarDesconto === 0 || config.aplicarDesconto === 1) ? descontoPercentualRef.current.getRawValue() : 0,
      subTotal
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync()

      const locationResponse = await Location.hasServicesEnabledAsync()

      if (!locationResponse) {
        Alert.alert('Erro', 'Seu dispositivo precisa estar com a localização ativada para fazer um pedido!')
        setLoading(false)
      } else {
        if (status === 'granted') {
          const local = await Location.getCurrentPositionAsync({ accuracy: Location.LocationAccuracy.Low })

          obj.latitude = local.coords.latitude
          obj.longitude = local.coords.longitude
          obj.precisaoLocalizacao = local.coords.accuracy
        }
      }
    } catch (error) {
      LogDAO.GravarLog(error.message)
    }

    ValidationNewPedidoSchema.validate(obj, { abortEarly: false })
      .then(async () => {
        try {
          await BackupControl.SetPedido(obj)
          await PedidoDAO.Save(obj)

          if (fechado === 1 && await checkConnection()) {
            try {
              await PedidoService.Sincronizar(5)
            } catch (error) {
              Alert.alert('Erro ao transmitir', `${error.message}. Seu pedido já está salvo no dispositivo, tente sincronizar mais tarde`)
            }
          } else if (fechado === 1 && (!await checkConnection())) {
            Alert.alert('Offline', 'Você está offline, seu pedido foi criado, porém só será sincronizado quando você estiver online.')
          }

          navigation.navigate('Pedidos', { sincronizarAposEnvio: true })
        } catch (error) {
          LogDAO.GravarLog(error.message)
          Alert.alert('Erro', error.message)
        } finally {
          setLoading(false)
        }
      })
      .catch(r => {
        scrollRef.current.scrollTo({ y: 0 })
        setValidation(r)
        Alert.alert('Validação', `${r?.errors?.length} campos não foram preenchidos corretamente`)
        setLoading(false)
      })
  }, [date, tempIdParam, id, cliente, anotacoes, formaPagamentoId, itens, descontoReal, subEmpresaId, empresa.id, total, config.aplicarDesconto, subTotal, navigation])

  const extrairErros = useCallback((campo) => {
    if (!validation || !validation?.errors?.length) {
      return null
    }

    const erro = validation?.inner.find(q => q.path === campo)

    if (erro === undefined) {
      return null
    }

    return erro.message
  }, [validation])

  const resetForm = useCallback(() => {
    setDate(new Date())
    setFormaPagamentoId('')
    setCliente(clienteParam || CLIENTE_INITIAL_STATE)
    setItens([])
    setSelecionados([])
    setAnotacoes('')
  }, [setDate, setFormaPagamentoId, setCliente, clienteParam, setItens, setSelecionados, setAnotacoes])

  const init = useCallback(async () => {
    const formasPagamentoResult = await FormaPagamentoDao.GetList()

    setFormasPagamento(formasPagamentoResult)

    if (tempIdParam) {
      const obj = await PedidoDAO.GetOne(tempIdParam)
      const cliente = await ClienteDAO.GetClienteWithTempId(obj.clienteId)

      setDate(new Date(obj.dataEHora))
      setFormaPagamentoId(obj.formaPagamentoId)
      setCliente(clienteParam || { id: cliente.id, apelido: cliente.apelido || cliente.nomeRazao })
      setItens(obj.itens)
      setSelecionados(obj.itens)
      setAnotacoes(obj.anotacoes)
      setQtdItem(obj.itens.length)
      setDescontoReal(obj.descontoReal)
      setDescontoRealStr(obj.descontoReal.toFixed(2))
      setDescontoPercentualStr(obj.descontoPercentual.toFixed(2))
      setSincronizado(obj.sincronizado)
      setRevertido(obj.revertido)
    } else {
      resetForm()
    }
  }, [setFormasPagamento, tempIdParam, setDate, setFormaPagamentoId, setCliente, setItens, setSelecionados, setAnotacoes, setQtdItem, setDescontoReal, setDescontoRealStr, setDescontoPercentualStr, resetForm, clienteParam])

  const validarDescontoPercentual = useCallback((percentual) => {
    if (percentual >= 100) {
      Alert.alert('Não autorizado', 'O desconto percentual não pode ser maior do que 100%')
      return
    }
    let descontoExcedido = config.descontoMaximo && percentual > config.descontoMaximo

    if (permissions.limiteDescontoPedido) {
      descontoExcedido = percentual > permissions.limiteDescontoPedido
    }

    if (descontoExcedido) {
      setDescontoRealStr('0,00')
      setDescontoPercentualStr('0,00')
      Alert.alert('Não autorizado', `O percentual de desconto aplicado excede o máximo permitido de ${(permissions.limiteDescontoPedido || config.descontoMaximo).toFixed(2)}%`)
      return false
    }

    return true
  }, [config.descontoMaximo, permissions.limiteDescontoPedido])

  const onBlurDescontoReal = useCallback(() => {
    const descontoPercentual = (config.aplicarDesconto === 0 || config.aplicarDesconto === 1) ? descontoPercentualRef.current.getRawValue() : 0
    const valor = totalComDescontoItens * (descontoPercentual / 100)

    if (!validarDescontoPercentual(descontoPercentual)) {
      return
    }

    setDescontoReal(valor)
    setDescontoRealStr(valor.toFixed(2))
  }, [config.aplicarDesconto, totalComDescontoItens, validarDescontoPercentual])

  const onBlurDescontoPercentual = useCallback(() => {
    const descontoReal = (config.aplicarDesconto === 0 || config.aplicarDesconto === 1) ? descontoRealRef.current.getRawValue() : 0
    const descontoPercentual = (descontoReal / totalComDescontoItens) * 100

    if (!validarDescontoPercentual(descontoPercentual)) {
      return
    }

    setDescontoReal(descontoReal)
    setDescontoPercentualStr(descontoPercentual.toFixed(2))
  }, [config.aplicarDesconto, totalComDescontoItens, validarDescontoPercentual])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { init() }, [tempIdParam])

  useFocusEffect(useCallback(() => {
    refreshConfig()
    refreshPermissions()
    if (!clienteParam) {
      return
    }

    setCliente(clienteParam)
  }, [clienteParam, refreshConfig, refreshPermissions]))

  useFocusEffect(useCallback(() => {
    if (!selecionados) {
      return
    }

    setQtdItem(selecionados.length)
    setItens(selecionados)
  }, [selecionados]))

  useEffect(() => {
    onBlurDescontoReal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itens])

  const renderItem = useCallback(({ item }) => <Item enabled={formHabilitado} item={item} navigation={navigation} />, [formHabilitado, navigation])

  return (
    <ScrollView1 ref={scrollRef} style={styles.container} >
      <View>
        <View style={styles.rowText}><Label>Cliente </Label><LabelRequired>*</LabelRequired></View>
        <TouchableOpacity disabled={!formHabilitado} onPress={() => navigation.navigate('SelectCliente')} >
          <ViewInput style={styles.rowSearch}>
            <Label style={{ width: 320 }}>
              {cliente.apelido || cliente.nomeRazao}
            </Label>
          </ViewInput>
        </TouchableOpacity>
        <LabelValidation>
          {extrairErros('clienteId')}
        </LabelValidation>
      </View>
      <View>
        <AlphaDateInput enabled={formHabilitado} validation={validation} onChange={(_, value) => setDate(value)} value={date} />
      </View>
      <View style={styles.formaPagamento}>
        <View style={styles.rowText}><Label>Forma de Pagamento </Label><LabelRequired>*</LabelRequired></View>
        <View>
          <ContainerPickerView>
            <Picker
              enabled={formHabilitado}
              placeholderTextColor={placeholderTextColor}
              style={defaultStyle.text}
              itemStyle={defaultStyle.itemStyle}
              selectedValue={formaPagamentoId}
              onValueChange={(itemValue) => setFormaPagamentoId(itemValue)}
            >
              <Picker.Item color={pickerItemColor} label="Selecione uma opção" value="" />
              {formasPagamento.map(({ id, nome }) => <Picker.Item color={pickerItemColor} key={id} label={`${(nome).toUpperCase()}`} value={id} />)}
            </Picker>
          </ContainerPickerView>
        </View>
        <LabelValidation>
          {extrairErros('formaPagamentoId')}
        </LabelValidation>
      </View>
      <View>
        <Label>
          Observação
        </Label>
        <Input editable={formHabilitado} maxLength={350} onChangeText={text => setAnotacoes(text)} value={anotacoes} multiline numberOfLines={4} placeholderTextColor={placeholderTextColor} placeholder="Descrever as observações" />
        <LabelValidation>
          {extrairErros('anotacoes')}
        </LabelValidation>
      </View>
      <ListItem2 style={{ borderTopEndRadius: 5, borderTopStartRadius: 5 }}>
        <ListItem3 style={styles.rowItens}>
          <Label18Bold>
            Itens
          </Label18Bold>
          <TouchableOpacity disabled={!formHabilitado} onPress={() => (navigation.navigate('Produtos', { selecionados: itens, formaPagamentoId }))}>
            <AntDesign style={{ marginRight: 5, marginTop: 5 }} name="pluscircle" size={35} color={formHabilitado ? textPrimaryAndSecondaryColor : disabled} />
          </TouchableOpacity>
        </ListItem3>
        <LabelValidation>
          {extrairErros('itens') || extrairErros('descontoReal')}
        </LabelValidation>
        <View style={styles.flatContainer}>
          <FlatList2
            ListEmptyComponent={() => <View><Label>Ainda não há itens neste pedido</Label></View>}
            data={itens}
            renderItem={renderItem}
            keyExtractor={_ => createUUID()}
          />
        </View>
      </ListItem2>
      <View styles={{ marginTop: 5 }}>
        <ListItem2 style={styles.rowQtdItem}>
          <Label18Bold>
            Total itens:
          </Label18Bold>
          <Label18Bold>
            {` ${qtdItem}`}
          </Label18Bold>
        </ListItem2>
      </View>
      {(config.aplicarDesconto === 0 || config.aplicarDesconto === 1) && <>
        <View style={[styles.rowDesc, { marginVertical: 5 }]}>
          <View>
            <Label style={{ marginBottom: 2 }}>Desconto geral (%)</Label>
            <TextInputMask
              type="money"
              options={{
                precision: 2,
                separator: ',',
                delimiter: '.',
                unit: '',
                suffixUnit: ''
              }}
              editable={formHabilitado}
              ref={descontoPercentualRef}
              onChangeText={(e) => setDescontoPercentualStr(e)}
              onBlur={onBlurDescontoReal}
              value={descontoPercentualStr}
              keyboardType="numeric"
              style={defaultStyle.input} />
            <LabelValidation>
              {extrairErros('descontoPercentual')}
            </LabelValidation>
          </View>
          <View>
            <Label style={{ marginBottom: 2 }}>Desconto geral (R$)</Label>
            <TextInputMask
              type="money"
              options={{
                precision: 2,
                separator: ',',
                delimiter: '.',
                unit: 'R$ ',
                suffixUnit: ''
              }}
              editable={formHabilitado}
              ref={descontoRealRef}
              onChangeText={(e) => setDescontoRealStr(e)}
              onBlur={onBlurDescontoPercentual}
              value={descontoRealStr}
              keyboardType="numeric"
              style={defaultStyle.input} />
          </View>
        </View>
      </>}
      <View style={styles.my5}>
        <ListItem2 style={{ borderRadius: 5 }}>
          <View style={styles.row}>
            <Label18Bold>
              Sub-total:
            </Label18Bold>
            <Label18Bold>
              {NumberUtil.toDisplayNumber(subTotal, 'R$', true)}
            </Label18Bold>
          </View>
          {!!descontoItens && <View style={styles.row}>
            <Label18Bold>
              Desconto dos itens:
            </Label18Bold>
            <Label18Bold>
              {NumberUtil.toDisplayNumber(descontoItens, 'R$', true)}
            </Label18Bold>
          </View>}
          <View style={styles.row}>
            <Label18Bold>
              Desconto da venda:
            </Label18Bold>
            <Label18Bold>
              {NumberUtil.toDisplayNumber(descontoReal, 'R$', true)}
            </Label18Bold>
          </View>
          <View style={styles.row}>
            <Label18Bold>
              Total:
            </Label18Bold>
            <Label18Bold>
              {NumberUtil.toDisplayNumber(total, 'R$', true)}
            </Label18Bold>
          </View>
        </ListItem2>
      </View>
      <View style={styles.orcamento}>
        <TouchableOpacityButtonWarning
          disabled={loading || !formHabilitado}
          onSubmit={() => submit(0)}
          label="SALVAR ORÇAMENTO"
        />
      </View>
      <View style={styles.pedido}>
        <TouchableOpacityButtonSuccess
          disabled={loading || !formHabilitado}
          onSubmit={() => submit(1)}
          label="SALVAR PEDIDO"
        />
      </View>
      <ModalBasic
        message='Salvando...'
        loading={loading}
      />
    </ScrollView1>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8
  },
  text: {
    fontSize: 16
  },
  row: {
    padding: 8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  rowDesc: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  rowItens: {
    padding: 8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopEndRadius: 5,
    borderTopStartRadius: 5
  },
  rowQtdItem: {
    padding: 8,
    paddingTop: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderBottomEndRadius: 5,
    borderBottomStartRadius: 5
  },
  item: {
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 0,
    paddingBottom: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomEndRadius: 5,
    borderBottomStartRadius: 5
  },
  rowSearch: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5
  },
  flatContainer: {
    padding: 10
  },
  rowText: {
    flexDirection: 'row'
  },
  formaPagamento: {
    marginTop: 10
  },
  orcamento: {
    marginVertical: 10,
    borderRadius: 10
  },
  pedido: {
    marginTop: 10,
    marginBottom: 30,
    borderRadius: 10
  },
  my5: {
    marginVertical: 5,
    borderRadius: 5
  }
})

export default NewPedidoScreen
