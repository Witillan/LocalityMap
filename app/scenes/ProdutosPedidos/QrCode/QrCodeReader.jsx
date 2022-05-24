import { AntDesign } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Camera } from 'expo-camera'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native'
import { Divider } from 'react-native-elements'
import { TextInputMask } from 'react-native-masked-text'
import FloatingButtonCarrinho from '../../../components/Buttons/FloatingButtonNumber'
import { PedidoContext } from '../../../components/navigation/contexts'
import { LabelValidation, useDefaultStyleSheet } from '../../../components/style'
import ValidationItemSchema from '../../../components/Validation/ItemNewPedidoValidation'
import ProdutoDAO from '../../../db/ProdutoDao'
import TabelaPrecoProdutoDAO from '../../../db/TabelaPrecoProdutoDao'
import { useConfig } from '../../../hooks/useConfig'
import { NumberUtil } from '../../../util/number'

const QrCodeReader = () => {
  const scheme = useColorScheme()
  const navigation = useNavigation()
  const { adicionarItem, selecionados, setProdutoSelecionadoIndex } = useContext(PedidoContext)
  const { defaultStyle, textSuccessColor, placeholderTextColor, pickerItemColor, textInfoColor, textColorBase } = useDefaultStyleSheet()
  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)
  const [item, setItem] = useState(null)
  const [quantidade, setQuantidade] = useState(1)
  const [quantidadeStr, setQuantidadeStr] = useState('1')
  const quantidadeRef = useRef(null)
  const [tabelasPreco, setTabelasPreco] = useState([])
  const [tabelaPrecoId, setTabelaPrecoId] = useState(null)
  const [config, refreshConfig] = useConfig()
  const casasDecimais = useMemo(() => (item?.fracionado || '').toLowerCase() === 'sim' ? 2 : 0, [item])

  useEffect(() => {
    setQuantidadeStr(casasDecimais ? '1,00' : '1')
  }, [casasDecimais])

  // Validar campos
  const [validation, setValidation] = useState(null)

  // Extrair erros do validador
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

  const consultarProduto = useCallback(async (codigoInterno, tabelaPrecoId = null) => {
    try {
      const filtro = { qrcode: codigoInterno }

      if (tabelaPrecoId) {
        filtro.tabelaPrecoId = tabelaPrecoId
      }

      const produtos = await ProdutoDAO.GetListComplete(filtro)

      if (produtos.length === 1) {
        setItem({ ...produtos[0] })
      } else if (produtos.length > 1) {
        Alert.alert('Erro', `Há ${produtos.length} produtos/itens de estoque com este número. Entre em contato com o suporte Alpha Software`, [
          {
            text: 'OK',
            onPress: () => setScanned(false)
          }
        ])
      } else {
        Alert.alert('Erro', 'Não foi encontrado nenhum produto com este número. Sincronize os dados novamente e tente em seguida', [
          {
            text: 'OK',
            onPress: () => setScanned(false)
          }
        ])
      }
    } catch (error) {
      alert('Ocorreu um erro ao consultar o QR Code, tente novamente')
      setScanned(false)
    }
  }, [setItem, setScanned])

  useFocusEffect(useCallback(() => {
    refreshConfig()
    setItem(null)
    setScanned(false)
  }, [refreshConfig]))

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === 'granted')
    })()
  }, [])

  useEffect(() => {
    if (!item) return

    TabelaPrecoProdutoDAO.GetAllByProdutoId(item.id)
      .then(res => setTabelasPreco(res))
      .catch(err => alert(err.message))
  }, [item])

  useEffect(() => {
    if (!item || item?.codigoInterno === undefined) return

    consultarProduto(item.codigoInterno, tabelaPrecoId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabelaPrecoId])

  const handleBarCodeScanned = useCallback(async ({ data }) => {
    if (!data) {
      alert('Não foi possível ler o QR Code, tente novamente')
      return
    }
    setScanned(true)

    consultarProduto(data)
  }, [setScanned, consultarProduto])

  const aumentarQuantidade = useCallback(() => {
    setQuantidade(quantidade + 1)
    setQuantidadeStr((quantidade + 1).toFixed(casasDecimais))
  }, [casasDecimais, quantidade])

  const diminuirQuantidade = useCallback(() => {
    setQuantidade(quantidade - 1)
    setQuantidadeStr((quantidade - 1).toFixed(casasDecimais))
  }, [casasDecimais, quantidade])

  const total = useMemo(() => selecionados?.map((q) => q.valorTotal).reduce((prev, curr) => prev + curr, 0), [selecionados])

  const submit = useCallback(async () => {
    const quantidade = quantidadeRef.current.getRawValue()

    const valorUnitario = item.valorVendaTabelado || item.valorVenda
    const subTotal = valorUnitario * quantidade

    const newItem = {
      ...item,
      id: null,
      produtoId: item.id,
      produtoCodigoInterno: item.codigoInterno,
      fracionado: item.fracionado || 'n',
      restringirEstoque: config.restringirEstoque,
      valorUnitario,
      descontoPercentual: 0,
      descontoReal: 0,
      quantidade,
      valorTotal: subTotal,
      subTotal
    }

    ValidationItemSchema
      .validate(newItem, { abortEarly: false })
      .then(() => {
        adicionarItem(newItem)
        setItem(null)
        setQuantidade(1)
        setQuantidadeStr('1')
        setScanned(false)
      })
      .catch((e) => {
        setValidation(e)
      })
  }, [quantidadeRef, item, config, adicionarItem, setItem, setQuantidade, setQuantidadeStr, setScanned, setValidation])

  const lerNovamente = useCallback(() => {
    setItem(null)
    setScanned(false)
    setQuantidade(1)
    setQuantidadeStr('1')
  }, [setItem, setScanned, setQuantidade, setQuantidadeStr])

  if (hasPermission === null) {
    return <View style={defaultStyle.background1}>
      <Text style={defaultStyle.text}>Solicitando permissão para usar a câmera</Text>
    </View>
  }

  if (hasPermission === false) {
    return <View style={defaultStyle.background1}>
      <Text style={defaultStyle.text}>Acesso a câmera negado, não será possível usar o leitor de QR Code</Text>
    </View>
  }
  
  return <View style={styles.container}>
    {!scanned && <Camera
      style={[StyleSheet.absoluteFillObject, defaultStyle.background1]}
      onBarCodeScanned={handleBarCodeScanned}
    />}
    {!!item && <KeyboardAvoidingView style={[styles.formContainer, defaultStyle.background1]} enabled behavior={Platform.OS === 'ios' ? 'position' : 'height'}>
      <View>
        <>
          <View style={[styles.rowCenter, { justifyContent: 'flex-start', marginBottom: 20 }]}>
            {item.fotoBase64
              // Quanto tem foto
              ? <Image source={{ uri: `data:image/jpeg;base64,${item.fotoBase64}` }} style={{ height: 120, width: 120, marginRight: 15 }} />
              // Quando não tem foto
              : (scheme === 'dark'
                ? <Image source={require('../../../assets/produtoDark.png')} style={{ height: 120, width: 120, marginRight: 15 }} />
                : <Image source={require('../../../assets/produtoLight.png')} style={{ height: 120, width: 120, marginRight: 15 }} />)}
            <View>
              <View style={{ marginBottom: 5 }}>
                <Text style={[styles.textBold, styles.fontSize18, defaultStyle.text, { width: 220 }]}>
                  {item.nome}
                </Text>
              </View>
              <View>
                <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={defaultStyle.text}>CÓDIGO:</Text>
                    <Text style={defaultStyle.textBold}>{` ${item.codigoInterno}`}</Text>
                  </View>
                </View>
                <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={defaultStyle.text}>MARCA:</Text>
                    <Text style={defaultStyle.textBold}>{` ${item.marca || '--'}`}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </>
        <Divider style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.verticalField}>
            <Text style={defaultStyle.text}>UN</Text>
            <Text style={defaultStyle.textBold}>
              {item.unidade || '--'}
            </Text>
          </View>
          <View style={styles.verticalField}>
            <Text style={defaultStyle.text}>ESTOQUE</Text>
            <Text style={defaultStyle.textBold}>
              {item.estoqueAtual || '--'}
            </Text>
          </View>
          <View style={styles.verticalField}>
            <Text style={[defaultStyle.text, { color: item.valorVendaTabelado ? textInfoColor : textColorBase }]}>VALOR UNITÁRIO</Text>
            <Text style={[defaultStyle.textBold, { color: item.valorVendaTabelado ? textInfoColor : textColorBase }]}>
              {NumberUtil.toDisplayNumber(item.valorVendaTabelado || item.valorVenda, 'R$', true)}
            </Text>
          </View>
        </View>
        <View style={[styles.mb15, { flexDirection: 'row' }]}>
          <View style={{ marginRight: 15 }}>
            <Text style={defaultStyle.text}>Digite a quantidade</Text>
            <TextInputMask
              type="money"
              options={{
                precision: casasDecimais,
                separator: ',',
                delimiter: '.',
                unit: '',
                suffixUnit: ''
              }}
              onBlur={() => {
                const valor = quantidadeRef.current.getRawValue()

                setQuantidade(valor)
              }}
              onFocus={() => {
                if (quantidade === 1) {
                  setQuantidadeStr()
                }
              }}
              ref={quantidadeRef}
              onChangeText={setQuantidadeStr}
              value={quantidadeStr}
              keyboardType="numeric"
              style={[defaultStyle.input, styles.mb5]}
            />
            <LabelValidation>
              {extrairErros('quantidade')}
            </LabelValidation>
          </View>
          <View style={{ alignItems: 'flex-end', marginRight: 5, alignSelf: 'center' }}>
            <TouchableOpacity style={[defaultStyle.buttonPrimary, { width: 50 }]} onPress={aumentarQuantidade}>
              <AntDesign name="plus" size={18} color="white" />
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: 'flex-end', alignSelf: 'center' }}>
            <TouchableOpacity style={[defaultStyle.buttonDanger, { width: 50 }]} disabled={quantidade <= 0} onPress={diminuirQuantidade}>
              <AntDesign name="minus" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        {!!tabelasPreco.length && <View style={styles.mb15}>
          <Text style={defaultStyle.text}>Selecione a tabela de preço</Text>
          <View style={defaultStyle.viewPicker}>
            <Picker
              placeholderTextColor={placeholderTextColor}
              style={defaultStyle.text}
              itemStyle={defaultStyle.itemStyle}
              label="Tabela de preço"
              selectedValue={tabelaPrecoId}
              onValueChange={(itemValue) => setTabelaPrecoId(itemValue)}
            >
              <Picker.Item color={pickerItemColor} label="Nenhuma" value="" />
              {tabelasPreco.map(({ id, nome }) => <Picker.Item key={`${id}-${nome}`} color={pickerItemColor} label={nome.toUpperCase()} value={id} />)}
            </Picker>
          </View>
        </View>}
        <View>
          <TouchableOpacity style={[defaultStyle.buttonSuccess, styles.mb15]} onPress={submit} color={textSuccessColor}>
            <Text style={defaultStyle.buttonText}>ADICIONAR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[defaultStyle.buttonWarning, styles.mb15]} onPress={lerNovamente} color={textSuccessColor}>
            <Text style={defaultStyle.buttonText}>LER QR CODE DE NOVO</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
    }
    {!!selecionados?.length && <FloatingButtonCarrinho
      number={selecionados?.length}
      icon="shoppingcart"
      style={styles.floatingBtn}
      onPress={() => {
        setProdutoSelecionadoIndex(null)
        navigation.navigate('Carrinho')
      }}
      total={total}
    />}
  </View>
}

export default QrCodeReader

const styles = StyleSheet.create({
  ph5: {
    paddingHorizontal: 5
  },
  container: {
    flex: 1
  },
  formContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    flex: 1
  },
  mb5: {
    marginBottom: 5
  },
  mb15: {
    marginBottom: 15
  },
  mb60: {
    marginBottom: 60
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
  divider: {
    backgroundColor: '#C1BFC0',
    marginTop: 6,
    marginBottom: 4
  },
  row: {
    display: 'flex',
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  verticalField: {
    display: 'flex',
    flexDirection: 'column'
  },
  floatingBtn: {
    position: 'absolute',
    bottom: 5,
    width: '100%',
    height: 50
  }
})
