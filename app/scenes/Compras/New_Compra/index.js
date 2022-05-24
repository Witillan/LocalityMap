import { AntDesign } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { format } from 'date-fns'
import * as Location from 'expo-location'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { TextInputMask } from 'react-native-masked-text'
import { CompraService } from '../../../api/compra'
import TouchableOpacityButtonSuccess from '../../../components/Buttons/TouchableOpacityButtonSuccess'
import TouchableOpacityButtonWarning from '../../../components/Buttons/TouchableOpacityButtonWarning'
import AlphaDateInput from '../../../components/Date/AlphaDateInput'
import { ModalBasic } from '../../../components/Modal/ModalLoading'
import { AuthContext, CompraContext } from '../../../components/navigation/contexts'
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
import ValidationNewCompraSchema from '../../../components/Validation/NewCompraValidation'
import CompraDAO from '../../../db/CompraDao'
import FormaPagamentoDao from '../../../db/FormaPagamentoDao'
import FornecedorDAO from '../../../db/FornecedorDao'
import LogDAO from '../../../db/LogDao'
import { checkConnection } from '../../../hooks/useNetworkStatus'
import { BackupControl } from '../../../util/backup'
import { createUUID } from '../../../util/guid'
import { NumberUtil } from '../../../util/number'

const Item = ({ item, enabled, navigation }) => {
  const casasDecimais = item.fracionado.toLowerCase() === 'sim' ? 2 : 0

  return <TouchableOpacity disabled={!enabled} onPress={() => {
    navigation.navigate('CarrinhoCompra')
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
      {((item.acrescimo > 0) || (item.descontoReal > 0)) && (
        <View style={styles.item}>
          <Label style={styles.text}>
            Acres.: {NumberUtil.toDisplayNumber(item.acrescimo, 'R$')}
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

const FORNECEDOR_INITIAL_STATE = { id: null, apelido: 'Ainda não selecionado' }
const NewCompraScreen = () => {
  const { defaultStyle, placeholderTextColor, pickerItemColor, textPrimaryAndSecondaryColor } = useDefaultStyleSheet()
  const route = useRoute()
  const navigation = useNavigation()

  // Obtendo o id da subEmpresa e empresa vinculadas ao usuario logado
  const { subEmpresaId, empresa } = useContext(AuthContext)

  // Obtendo os itens selecionados
  const { selecionados, setSelecionados } = useContext(CompraContext)

  // controlando campo de data e hora
  const [date, setDate] = useState(new Date())
  const [loading, setLoading] = useState(false)
  // Campos do form
  const [formaPagamentoId, setFormaPagamentoId] = useState('')
  // const [descontoRealStr, setDescontoRealStr] = useState('0.00')
  const [acrescimoStr, setAcrescimoStr] = useState('0.00')
  // const [descontoPercentualStr, setDescontoPercentualStr] = useState('0.00');

  const [fornecedor, setFornecedor] = useState(FORNECEDOR_INITIAL_STATE)

  const [itens, setItens] = useState([])
  const [anotacoes, setAnotacoes] = useState('')

  // Validação do form
  const [validation, setValidation] = useState(null)
  const scrollRef = useRef(null)
  // const descontoRealRef = useRef(null)
  const acrescimoRef = useRef(null)
  // const descontoPercentualRef = useRef(null);
  // const [descontoGeral, setDescontoGeral] = useState(0)
  const [acrescimoGeral, setAcrescimoGeral] = useState(0)

  const { fornecedorParam, tempIdParam, id } = route?.params || {}
  const [formasPagamento, setFormasPagamento] = useState([])

  const [qtdItem, setQtdItem] = useState(0)

  const totalComDescontoEAcrescimosItens = NumberUtil.mapSum(itens.map(item => item.valorTotal))
  const descontoItens = NumberUtil.mapSum(itens.map(item => item.descontoReal))
  const acrescimoItens = NumberUtil.mapSum(itens.map(item => item.acrescimo))
  const subTotal = NumberUtil.mapSum(itens.map(item => item.valorUnitario * item.quantidade))
  const total = totalComDescontoEAcrescimosItens + acrescimoGeral

  const submit = async (fechado) => {
    setLoading(true)
    const dataEHora = format(new Date(), "yyyy-MM-dd'T'HH:mm")
    const tempId = tempIdParam || createUUID()

    const obj = {
      tempId,
      id: null,
      idAlphaExpress: 0,
      numeroCompra: 0,
      sincronizado: 0,
      fornecedorId: fornecedor?.id,
      fornecedor,
      anotacoes,
      dataEHora,
      formaPagamentoId,
      itens: itens.map(item => ({ ...item, tempCompraId: tempId, tempId: createUUID(), empresaId: empresa.id })),
      descontoReal: 0,
      acrescimo: acrescimoGeral,
      subEmpresaId,
      fechado,
      idAparelho: createUUID(),
      empresaId: empresa.id,
      total,
      // descontoPercentual: descontoPercentualRef.current.getRawValue(),
      subTotal
    }

    const { status } = await Location.requestForegroundPermissionsAsync()

    const locationResponse = await Location.hasServicesEnabledAsync()

    if (!locationResponse) {
      Alert.alert('Erro', 'Seu dispositivo precisa estar com a localização ativada para fazer um compra!')
      setLoading(false)
      return
    }

    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync()

      obj.latitude = location.coords.latitude
      obj.longitude = location.coords.longitude
      obj.precisaoLocalizacao = location.coords.accuracy
    }

    ValidationNewCompraSchema.validate(obj, { abortEarly: false })
      .then(async () => {
        try {
          await BackupControl.SetCompra(obj)
          await CompraDAO.Save(obj)

          if (fechado === 1 && (await checkConnection())) {
            try {
              await CompraService.Sincronizar()
            } catch (error) {
              Alert.alert('Erro ao transmitir', `${error.message}. Seu compra já está salvo no dispositivo, tente sincronizar mais tarde`)
            }
          } else if (fechado === 1 && (!await checkConnection())) {
            Alert.alert('Offline', 'Você está offline, seu compra foi criado, porém só será sincronizado quando você estiver online.')
          }

          navigation.navigate('Compras')
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
  }

  const extrairErros = (campo) => {
    if (!validation || !validation?.errors?.length) {
      return null
    }

    const erro = validation?.inner.find(q => q.path === campo)

    if (erro === undefined) {
      return null
    }

    return erro.message
  }

  const resetForm = useCallback(() => {
    setDate(new Date())
    setFormaPagamentoId('')
    setFornecedor(fornecedorParam || FORNECEDOR_INITIAL_STATE)
    setItens([])
    setSelecionados([])
    setAnotacoes('')
  }, [fornecedorParam, setSelecionados])

  const init = useCallback(async () => {
    const formasPagamentoResult = await FormaPagamentoDao.GetList()

    setFormasPagamento(formasPagamentoResult)

    if (tempIdParam) {
      const obj = await CompraDAO.GetOne(tempIdParam)
      const fornecedor = await FornecedorDAO.GetFornecedorWithTempId(obj.fornecedorId)

      setDate(new Date(obj.dataEHora))
      setFormaPagamentoId(obj.formaPagamentoId)
      setFornecedor(fornecedorParam || { id: fornecedor.id, apelido: fornecedor.apelido || fornecedor.nomeRazao })
      setItens(obj.itens)
      setSelecionados(obj.itens)
      setAnotacoes(obj.anotacoes)
      setQtdItem(obj.itens.length)
      setAcrescimoGeral(obj.acrescimo)
      setAcrescimoStr(obj.acrescimo.toFixed(2))
      // setDescontoPercentualStr(obj.descontoPercentual.toFixed(2))
    } else {
      resetForm()
    }
  }, [fornecedorParam, resetForm, setSelecionados, tempIdParam])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { init() }, [tempIdParam])

  useFocusEffect(useCallback(() => {
    if (!fornecedorParam) {
      return
    }

    setFornecedor(fornecedorParam)
  }, [fornecedorParam]))

  useFocusEffect(useCallback(() => {
    if (!selecionados) {
      return
    }

    setQtdItem(selecionados.length)
    setItens(selecionados)
  }, [selecionados]))

  // useEffect(() => {
  //   setDescontoReal()
  // }, [itens])

  // const setDescontoReal = () => {
  //   const descontoReal = descontoRealRef.current.getRawValue()
  //   setDescontoGeral(descontoReal)
  //   setDescontoRealStr(descontoReal.toFixed(2))
  // }

  const acrescimo = () => {
    const acrescimo = acrescimoRef.current.getRawValue()
    setAcrescimoGeral(acrescimo)
    setAcrescimoStr(acrescimo.toFixed(2))
  }

  const renderItem = useCallback(({ item }) => <Item enabled={!id} item={item} navigation={navigation} />, [id, navigation])

  return (
    <ScrollView1 ref={scrollRef} style={styles.container} >
      <View>
        <View style={styles.rowText}><Label>Fornecedor </Label><LabelRequired>*</LabelRequired></View>
        <TouchableOpacity disabled={!!id} onPress={() => navigation.navigate('SelectFornecedor')} >
          <ViewInput style={styles.rowSearch}>
            <Label style={{ width: 320 }}>
              {fornecedor.apelido || fornecedor.nomeRazao}
            </Label>
          </ViewInput>
        </TouchableOpacity>
        <LabelValidation>
          {extrairErros('fornecedorId')}
        </LabelValidation>
      </View>
      <View>
        <AlphaDateInput enabled={!id} validation={validation} onChange={(_, value) => setDate(value)} value={date} />
      </View>
      <View style={styles.formaPagamento}>
        <View style={styles.rowText}><Label>Forma de Pagamento </Label><LabelRequired>*</LabelRequired></View>
        <View>
          <ContainerPickerView>
            <Picker
              enabled={!id}
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
        <Input editable={!id} maxLength={350} onChangeText={text => setAnotacoes(text)} value={anotacoes} multiline numberOfLines={4} placeholderTextColor={placeholderTextColor} placeholder="Descrever as observações" />
        <LabelValidation>
          {extrairErros('anotacoes')}
        </LabelValidation>
      </View>
      <ListItem2 style={{ borderTopEndRadius: 5, borderTopStartRadius: 5 }}>
        <ListItem3 style={styles.rowItens}>
          <Label18Bold>
            Itens
          </Label18Bold>
          <TouchableOpacity disabled={!!id} onPress={() => (navigation.navigate('ProdutosCompra', { selecionados: itens }))}>
            <AntDesign style={{ marginRight: 5, marginTop: 5 }} name="pluscircle" size={35} color={textPrimaryAndSecondaryColor} />
          </TouchableOpacity>
        </ListItem3>
        <LabelValidation>
          {extrairErros('itens') || extrairErros('descontoReal')}
        </LabelValidation>
        <View style={styles.flatContainer}>
          <FlatList2
            ListEmptyComponent={() => <View><Label>Ainda não há itens neste compra</Label></View>}
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
      <View style={[styles.rowDesc, { marginVertical: 5 }]}>
        {/* <View>
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
                        editable={!id}
                        ref={descontoPercentualRef}
                        onChangeText={(e) => setDescontoPercentualStr(e)}
                        onBlur={setDescontoReal}
                        value={descontoPercentualStr}
                        keyboardType="numeric"
                        style={defaultStyle.input} />
                    <LabelValidation>
                        {extrairErros("descontoPercentual")}
                    </LabelValidation>
                </View> */}
        <View>
          <Label style={{ marginBottom: 2 }}>Acrescimo geral (%)</Label>
          <TextInputMask
            type="money"
            options={{
              precision: 2,
              separator: ',',
              delimiter: '.',
              unit: '',
              suffixUnit: ''
            }}
            editable={!id}
            ref={acrescimoRef}
            onChangeText={(e) => setAcrescimoStr(e)}
            onBlur={acrescimo}
            value={acrescimoStr}
            keyboardType="numeric"
            style={defaultStyle.input} />
          <LabelValidation>
            {extrairErros('descontoPercentual')}
          </LabelValidation>
        </View>
        {/* <View>
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
            editable={!id}
            ref={descontoRealRef}
            onBlur={setDescontoReal}
            onChangeText={(e) => setDescontoRealStr(e)}
            value={descontoRealStr}
            keyboardType="numeric"
            style={defaultStyle.input} />
        </View> */}
      </View>
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
          {!!acrescimoItens && <View style={styles.row}>
            <Label18Bold>
              Acréscimo dos itens:
            </Label18Bold>
            <Label18Bold>
              {NumberUtil.toDisplayNumber(acrescimoItens, 'R$', true)}
            </Label18Bold>
          </View>}
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
              Acréscimo da compra:
            </Label18Bold>
            <Label18Bold>
              {NumberUtil.toDisplayNumber(acrescimoGeral, 'R$', true)}
            </Label18Bold>
          </View>
          {/* <View style={styles.row}>
            <Label18Bold>
              Desconto da compra:
            </Label18Bold>
            <Label18Bold>
              {NumberUtil.toDisplayNumber(descontoGeral, 'R$', true)}
            </Label18Bold>
          </View> */}
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
          disabled={loading || !!id}
          onSubmit={() => submit(0)}
          label="SALVAR ORÇAMENTO"
        />
      </View>
      <View style={styles.compra}>
        <TouchableOpacityButtonSuccess
          disabled={loading || !!id}
          onSubmit={() => submit(1)}
          label="SALVAR COMPRA"
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
  compra: {
    marginTop: 10,
    marginBottom: 30,
    borderRadius: 10
  },
  my5: {
    marginVertical: 5,
    borderRadius: 5
  }
})

export default NewCompraScreen
