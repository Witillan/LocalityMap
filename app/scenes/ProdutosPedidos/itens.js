import { AntDesign, Entypo } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Image, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import { Divider } from 'react-native-elements'
import { Swipeable } from 'react-native-gesture-handler'
import { MaskService, TextInputMask } from 'react-native-masked-text'
import { Snackbar } from 'react-native-paper'
import TouchableOpacityButtonPrimary from '../../components/Buttons/TouchableOpacityButtonPrimary'
import TouchableOpacityButtonSuccess from '../../components/Buttons/TouchableOpacityButtonSuccess'
import { Label, Label18Bold, LabelBold, LabelValidation, ListItem2, ListItem3, useDefaultStyleSheet } from '../../components/style'
import ValidationItemSchema from '../../components/Validation/ItemNewPedidoValidation'
import { useConfig } from '../../hooks/useConfig'
import { NumberUtil } from '../../util/number'
import * as Localization from 'expo-localization'
import moment from 'moment-timezone'
import { formatTimeByOffset } from '../../util/date'
import { usePermissions, UsuarioPermissaoOpcao } from '../../hooks/usePermissions'

export const ItemLista = ({ item, submit, setProdutoSelecionadoIndex, produtoSelecionadoIndex, index, config, permissions, onItemPress }) => {
  const { defaultStyle, textSuccessColor, textInfoColor, textColorBase } = useDefaultStyleSheet()
  const scheme = useColorScheme()
  const dark = scheme === 'dark'
  const quantidadeRef = useRef(null)
  const casasDecimais = useMemo(() => (item?.fracionado || '').toLowerCase() === 'sim' ? 2 : 0, [item])
  const [quantidadeStr, setQuantidadeStr] = useState((1).toFixed(casasDecimais))
  const [quantidade, setQuantidade] = useState(1)

  // Desconto em porcentagem
  const descontoPercentualRef = useRef(null)
  const [descontoPercentualStr, setDescontoPercentualStr] = useState('0')
  const [descontoPercentual, setDescontoPercentual] = useState(0)

  // Desconto em reais
  const descontoRealRef = useRef(null)
  const [descontoReal, setDescontoReal] = useState(0)
  const [descontoRealStr, setDescontoRealStr] = useState('0')

  // Valor unitário
  const valorUnitarioRef = useRef(null)
  const [valorUnitario, setValorUnitario] = useState(item.valorVendaTabelado || item.valorVenda)
  const [valorUnitarioStr, setValorUnitarioStr] = useState(item.valorVendaTabelado || item.valorVenda.toFixed(2))
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const ref = useRef(null)
  const [timezone, setTimezone] = useState('America/Manaus')

  const [submitting, setSubmitting] = useState(false)

  // Validar campos
  const [validation, setValidation] = useState(null)

  const calcTotal = useCallback((total, quantidade) => {
    return parseFloat(total) * parseFloat(quantidade)
  }, [])

  const calcDescontoTotal = useCallback((descontoReal, quantidade) => {
    return parseFloat(descontoReal) * parseFloat(quantidade)
  }, [])

  const calcDescontoEmReal = useCallback((porcentagem) => {
    const final = calcTotal((valorUnitario), quantidade)

    return (final * (porcentagem / 100))
  }, [calcTotal, quantidade, valorUnitario])

  const calcDescontoEmPercentual = useCallback((real) => {
    const final = calcTotal(valorUnitario, quantidade)

    return (real / final) * 100
  }, [calcTotal, quantidade, valorUnitario])

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

  const submitItem = useCallback(async () => {
    if (ref && ref.current) {
      ref.current.close()
    }

    setSubmitting(true)

    const objSubmit = {
      restringirEstoque: config.restringirEstoque,
      subTotal: calcTotal(valorUnitario, quantidade),
      descontoReal,
      descontoPercentual,
      quantidade,
      estoqueAtual: item.estoqueAtual,
      produtoId: item.id,
      nome: item.nome,
      produtoCodigoInterno: item.codigoInterno,
      valorUnitario,
      valorVendaTabelado: item.valorVendaTabelado,
      fracionado: item.fracionado || 'n',
      valorTotal: calcTotal(valorUnitario, quantidade) - calcDescontoTotal(descontoReal, quantidade),
      fotoBase64: item.fotoBase64,
      promocao: item.promocao,
      valorPromocao: item.valorPromocao,
      inicioPromocao: item.inicioPromocao,
      finalPromocao: item.finalPromocao,
      aviso: item.aviso
    }

    ValidationItemSchema
      .validate(objSubmit, { abortEarly: false })
      .then(() => {
        setProdutoSelecionadoIndex(null)
        setSnackbarOpen(true)
        setTimeout(() => setSnackbarOpen(false), 1000)
        submit(objSubmit)

        setDescontoPercentual(0)
        setDescontoPercentualStr('0')
        setDescontoReal(0)
        setDescontoRealStr('0')
        setQuantidade(1)
        setQuantidadeStr((1).toFixed(casasDecimais))
      })
      .catch((r) => {
        setValidation(r)
        setProdutoSelecionadoIndex(index)
      })
      .finally(() => setSubmitting(false))
  }, [config.restringirEstoque, calcTotal, valorUnitario, quantidade, descontoReal, descontoPercentual, item.estoqueAtual, item.id, item.nome, item.codigoInterno, item.valorVendaTabelado, item.fracionado, item.fotoBase64, item.promocao, item.valorPromocao, item.inicioPromocao, item.finalPromocao, item.aviso, calcDescontoTotal, setProdutoSelecionadoIndex, submit, casasDecimais, index])

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
  }, [config, permissions])

  const onBlurDescontoPercentual = useCallback(() => {
    const valor = descontoPercentualRef.current.getRawValue()

    if (!validarDescontoPercentual(valor)) {
      return
    }

    setDescontoPercentual(valor || 0)
    setDescontoReal(calcDescontoEmReal(valor))
    setDescontoRealStr(calcDescontoEmReal(valor).toFixed(2))
  }, [validarDescontoPercentual, calcDescontoEmReal])

  const onBlurDescontoReal = useCallback(() => {
    const valor = descontoRealRef.current.getRawValue()
    const descontoPercentual = calcDescontoEmPercentual(valor)

    if (!validarDescontoPercentual(descontoPercentual)) {
      return
    }

    setDescontoReal(valor)
    setDescontoPercentual(descontoPercentual)
    setDescontoPercentualStr(descontoPercentual.toFixed(2))
  }, [calcDescontoEmPercentual, validarDescontoPercentual])

  const aumentarQuantidade = useCallback(() => {
    setQuantidade(quantidade + 1)
    setQuantidadeStr((quantidade + 1).toFixed(casasDecimais))
  }, [setQuantidade, setQuantidadeStr, quantidade, casasDecimais])

  const diminuirQuantidade = useCallback(() => {
    setQuantidade(quantidade - 1)
    setQuantidadeStr((quantidade - 1).toFixed(casasDecimais))
  }, [setQuantidade, quantidade, setQuantidadeStr, casasDecimais])

  const exibirDesconto = useMemo(() => {
    if (item.promocao > 0) {
      return false
    }

    if (item.valorVendaTabelado > 0 && !config.aplicaDescontoComTabelaPreco) {
      return false
    }

    return (config.aplicarDesconto === 0 || config.aplicarDesconto === 2)
  }, [item, config])

  useEffect(() => {
    if (!descontoPercentualRef || !descontoPercentualRef.current) return

    onBlurDescontoPercentual()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantidade])

  useEffect(() => {
    if (item.promocao === 1) {
      setValorUnitarioStr(item.valorPromocao.toFixed(2))
      setValorUnitario(item.valorPromocao)
      return
    }
    if (item.promocao === 2) {
      const today = moment().tz(timezone)
      const currentTimeZoneOffsetInHours = today.utcOffset() / 60

      const inicioPromocao = new Date(item.inicioPromocao)
      const finalPromocao = new Date(item.finalPromocao)
      const dataAtual = formatTimeByOffset(new Date().toISOString(), currentTimeZoneOffsetInHours)

      if (item.promocao === 2 && dataAtual >= inicioPromocao && dataAtual <= finalPromocao) {
        setValorUnitarioStr(item.valorPromocao.toFixed(2))
        setValorUnitario(item.valorPromocao)
        return
      }
    }

    if (!item.valorVendaTabelado) {
      setValorUnitarioStr(item.valorVenda.toFixed(2))
      setValorUnitario(item.valorVenda)
      return
    }

    setValorUnitarioStr(item.valorVendaTabelado.toFixed(2))
    setValorUnitario(item.valorVendaTabelado)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.valorVendaTabelado, item.promocao, item.valorDesconto, config.aplicaDescontoComTabelaPreco])

  useEffect(() => {
    if (!config.aplicaDescontoComTabelaPreco) {
      setDescontoPercentual(0)
      setDescontoPercentualStr('0,00')
      setDescontoReal(0)
      setDescontoRealStr('0,00')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.valorVendaTabelado])

  useEffect(() => {
    Localization.getLocalizationAsync()
      .then(localization => {
        setTimezone(localization.timezone)
      })
  }, [])

  const corValorUnitario = useMemo(() => {
    if (item.promocao === 1) {
      return 'orange'
    }

    const today = moment().tz(timezone)
    const currentTimeZoneOffsetInHours = today.utcOffset() / 60
    const inicioPromocao = new Date(item.inicioPromocao)
    const finalPromocao = new Date(item.finalPromocao)
    const dataAtual = formatTimeByOffset(new Date().toISOString(), currentTimeZoneOffsetInHours)

    if (item.promocao === 2 && dataAtual >= inicioPromocao && dataAtual <= finalPromocao) {
      return 'orange'
    }
    return item.valorVendaTabelado ? textInfoColor : textColorBase
  }, [item.finalPromocao, item.inicioPromocao, item.promocao, item.valorVendaTabelado, textColorBase, textInfoColor, timezone])

  const editarValorUnitario = useMemo(() => {
    if (!config.alterarValorProduto) {
      return false
    }

    if (!isNaN(permissions.alterarValorUnitarioPedido)) {
      return permissions.alterarValorUnitarioPedido === UsuarioPermissaoOpcao.Autorizado && item.promocao === 0
    }

    return item.promocao === 0
  }, [item, config, permissions])

  return <Swipeable
    enabled={!!config.arrastarParaAdicionar && index !== produtoSelecionadoIndex && !submitting}
    ref={ref}
    renderLeftActions={() => <View style={{ backgroundColor: textSuccessColor, width: 15 }}></View>}
    onSwipeableLeftOpen={submitItem}
  >
    <TouchableOpacity onPress={() => {
      if (onItemPress) { onItemPress() }

      setProdutoSelecionadoIndex(index === produtoSelecionadoIndex ? null : index)
    }}>
      <ListItem2>
        {item.fotoBase64
          ? <>
            <View style={[styles.rowCenter, { justifyContent: 'flex-start' }]}>
              <Image source={{ uri: `data:image/jpeg;base64,${item.fotoBase64}` }} style={{ height: 80, width: 80, marginRight: 15 }} />
              <View>
                <View style={{ marginBottom: 5 }}>
                  <Label18Bold style={{ width: 220 }}>
                    {item.nome}
                  </Label18Bold>
                </View>
                <View>
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
                  ? <Image source={require('../../assets/produtoDark.png')} style={{ height: 80, width: 80, marginRight: 15 }} />
                  : <Image source={require('../../assets/produtoLight.png')} style={{ height: 80, width: 80, marginRight: 15 }} />
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
            <Label>CÓD.</Label>
            <LabelBold>
              {item.codigoInterno || '--'}
            </LabelBold>
          </View>
          <View style={styles.verticalField}>
            <Label>ESTOQUE</Label>
            <LabelBold>
              {item.estoqueAtual || '--'}
            </LabelBold>
          </View>
          <View style={styles.verticalField}>
            <Label style={{ color: corValorUnitario }}>VALOR UNIT. PRODUTO</Label>
            <LabelBold style={{ color: corValorUnitario }}>
              {NumberUtil.toDisplayNumber(valorUnitario, 'R$', true)}
            </LabelBold>
          </View>
        </View>
      </ListItem2>
    </TouchableOpacity>
    {index === produtoSelecionadoIndex && <ListItem3>
      <View>
        <View style={styles.verticalField}>
          <Label>QTD</Label>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <TextInputMask
              type="money"
              options={{
                precision: casasDecimais,
                separator: ',',
                delimiter: '.',
                unit: '',
                suffixUnit: ''
              }}
              ref={quantidadeRef}
              onBlur={() => {
                const valor = quantidadeRef.current.getRawValue()

                setQuantidade(valor)
              }}
              onFocus={() => {
                if (quantidade === 1) {
                  setQuantidadeStr()
                }
              }}
              onChangeText={(e) => setQuantidadeStr(e)}
              value={quantidadeStr}
              keyboardType="numeric"
              style={[{ minWidth: 120 }, defaultStyle.input]}
            />
            <TouchableOpacity style={styles.ph5} onPress={aumentarQuantidade}>
              <AntDesign name="upcircle" size={27} color="green" />
            </TouchableOpacity>
            <TouchableOpacity disabled={quantidade <= 0} onPress={diminuirQuantidade}>
              <AntDesign style={styles.ph5} name="downcircle" size={27} color={quantidade <= 0 ? 'gray' : '#ff5232'} />
            </TouchableOpacity>
          </View>
          <LabelValidation>
            {extrairErros('quantidade')}
          </LabelValidation>
        </View>
      </View>
      <Divider style={styles.divider} />
      {editarValorUnitario && <>
        <View>
          <View>
            <Label>VALOR UNITÁRIO ITEM</Label>
            <TextInputMask
              type="money"
              options={{
                precision: 2,
                separator: ',',
                delimiter: '.',
                unit: '',
                suffixUnit: ''
              }}
              onBlur={() => {
                const valor = valorUnitarioRef.current.getRawValue()

                setValorUnitario(valor)
              }}
              ref={valorUnitarioRef}
              onChangeText={e => setValorUnitarioStr(e)}
              value={valorUnitarioStr}
              style={defaultStyle.input}
              keyboardType="numeric" />
          </View>
        </View>
        <Divider style={styles.divider} />
      </>
      }
      {exibirDesconto && <>
        <View>
          <View>
            <Label>% DESCONTO</Label>
            <TextInputMask
              type="money"
              options={{
                precision: 2,
                separator: ',',
                delimiter: '.',
                unit: '',
                suffixUnit: ''
              }}
              ref={descontoPercentualRef}
              onBlur={onBlurDescontoPercentual}
              onChangeText={e => setDescontoPercentualStr(e)}
              value={descontoPercentualStr}
              style={defaultStyle.input}
              keyboardType="numeric" />
          </View>
          <LabelValidation>
            {extrairErros('descontoPercentual')}
          </LabelValidation>
        </View>
        <Divider style={styles.divider} />
        <View>
          <Label>DESCONTO(R$)</Label>
          <TextInputMask
            type="money"
            options={{
              precision: 2,
              separator: ',',
              delimiter: '.',
              unit: '',
              suffixUnit: ''
            }}
            ref={descontoRealRef}
            onBlur={onBlurDescontoReal}
            onChangeText={(e) => setDescontoRealStr(e)}
            value={descontoRealStr}
            keyboardType="numeric"
            style={defaultStyle.input} />
          <LabelValidation>
            {extrairErros('descontoReal')}
          </LabelValidation>
        </View>
        <Divider style={styles.divider} />
      </>
      }
      <View style={styles.row}>
        <View style={styles.verticalField}>
          <Label>SUBTOTAL</Label>
          <LabelBold>
            {MaskService.toMask('money', (calcTotal(valorUnitario, quantidade)), { unit: ' R$' })}
          </LabelBold>
        </View>
        <View style={styles.verticalField}>
          <Label>TOTAL</Label>
          <LabelBold>
            {MaskService.toMask('money', (calcTotal(valorUnitario, quantidade) - calcDescontoTotal(descontoReal, quantidade)), { unit: ' R$' })}
          </LabelBold>
        </View>
      </View>
      <TouchableOpacityButtonSuccess
        disabled={false}
        onSubmit={submitItem}
        label="ADICIONAR ITEM"
      />
      <Snackbar
        visible={snackbarOpen}>
        Item adicionado com sucesso!
      </Snackbar>
    </ListItem3>}
  </Swipeable>
}

export const ItemCarrinho = ({ item, onDelete, submit, produtoSelecionadoIndex, setProdutoSelecionadoIndex, index }) => {
  const { defaultStyle, textDangerColor } = useDefaultStyleSheet()
  const scheme = useColorScheme()
  const dark = scheme === 'dark'
  const casasDecimais = (item.fracionado || '').toLowerCase() === 'sim' ? 2 : 0
  const quantidadeRef = useRef(null)
  const [quantidadeStr, setQuantidadeStr] = useState((item.quantidade || 0).toFixed(casasDecimais))
  const [quantidade, setQuantidade] = useState(item.quantidade)
  const [config, refreshConfig] = useConfig()
  const [permissions, refreshPermissions] = usePermissions()

  // Desconto em porcentagem
  const descontoPercentualRef = useRef(null)
  const [descontoPercentual, setDescontoPercentual] = useState(item.descontoPercentual || 0)
  const [descontoPercentualStr, setDescontoPercentualStr] = useState((item.descontoPercentual || 0).toFixed(2))

  // Desconto em reais
  const descontoRealRef = useRef(null)
  const [descontoReal, setDescontoReal] = useState(item.descontoReal || 0)
  const [descontoRealStr, setDescontoRealStr] = useState((item.descontoReal || 0).toFixed(2))

  // Valor unitário
  const valorUnitarioRef = useRef(null)
  const [valorUnitario, setValorUnitario] = useState(item.valorUnitario)
  const [valorUnitarioStr, setValorUnitarioStr] = useState((item.valorUnitario || 0).toFixed(2))

  // Validar campos
  const [validation, setValidation] = useState(null)

  useFocusEffect(useCallback(() => {
    refreshConfig()
    refreshPermissions()
  }, [refreshConfig, refreshPermissions]))

  const aumentarQuantidade = useCallback(() => {
    setQuantidade(quantidade + 1)
    setQuantidadeStr((quantidade + 1).toFixed(casasDecimais))
  }, [setQuantidade, setQuantidadeStr, quantidade, casasDecimais])

  const diminuirQuantidade = useCallback(() => {
    setQuantidade(quantidade - 1)
    setQuantidadeStr((quantidade - 1).toFixed(casasDecimais))
  }, [setQuantidade, setQuantidadeStr, quantidade, casasDecimais])

  const calcTotal = useCallback((total, quantidade) => {
    return parseFloat(total) * parseFloat(quantidade)
  }, [])

  const calcDescontoTotal = useCallback((descontoReal, quantidade) => {
    return parseFloat(descontoReal) * parseFloat(quantidade)
  }, [])

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

  const calcDescontoEmReal = useCallback((porcentagem) => {
    const final = calcTotal(valorUnitario, quantidade)

    return (final * (porcentagem / 100))
  }, [calcTotal, quantidade, valorUnitario])

  const calcDescontoEmPercentual = useCallback((real) => {
    const final = calcTotal(valorUnitario, quantidade)

    return (real / final) * 100
  }, [calcTotal, valorUnitario, quantidade])

  const submitItem = useCallback(() => {
    const objSubmit = {
      descontoReal,
      descontoPercentual,
      quantidade,
      produtoId: item.produtoId,
      estoqueAtual: item.estoqueAtual,
      nome: item.nome,
      fracionado: item.fracionado,
      produtoCodigoInterno: item.codigoInterno,
      valorUnitario,
      subTotal: calcTotal(valorUnitario, quantidade),
      valorTotal: calcTotal(valorUnitario, quantidade) - calcDescontoTotal(descontoReal, quantidade)
    }

    ValidationItemSchema
      .validate(objSubmit, { abortEarly: false })
      .then(() => {
        submit(objSubmit)
      })
      .catch((e) => {
        setValidation(e)
        setProdutoSelecionadoIndex(index)
      })
  }, [descontoReal, descontoPercentual, quantidade, item.produtoId, item.estoqueAtual, item.nome, item.fracionado, item.codigoInterno, valorUnitario, calcTotal, calcDescontoTotal, submit, setProdutoSelecionadoIndex, index])

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
  }, [config, permissions])
  const onBlurDescontoPercentual = useCallback(() => {
    const valor = descontoPercentualRef.current.getRawValue()

    if (!validarDescontoPercentual(valor)) {
      return
    }

    setDescontoPercentual(valor || 0)
    setDescontoReal(calcDescontoEmReal(valor))
    setDescontoRealStr(calcDescontoEmReal(valor).toFixed(2))
  }, [validarDescontoPercentual, calcDescontoEmReal])

  const onBlurDescontoReal = useCallback(() => {
    const valor = descontoRealRef.current.getRawValue()
    const novoDescontoPercentual = calcDescontoEmPercentual(valor)

    if (!validarDescontoPercentual(novoDescontoPercentual)) {
      return
    }

    setDescontoReal(valor || 0)
    setDescontoPercentual(novoDescontoPercentual)
    setDescontoPercentualStr(novoDescontoPercentual.toFixed(2))
  }, [calcDescontoEmPercentual, validarDescontoPercentual])

  useEffect(() => {
    if (!descontoPercentualRef || !descontoPercentualRef.current) return

    onBlurDescontoPercentual()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantidade])

  const editarDesconto = useMemo(() => {
    if (item.promocao === 1) {
      return false
    }

    if (item.valorVendaTabelado > 0 && !config.aplicaDescontoComTabelaPreco) {
      return false
    }

    return (config.aplicarDesconto === 0 || config.aplicarDesconto === 2)
  }, [item, config])

  const editarValorUnitario = useMemo(() => {
    if (!config.alterarValorProduto) {
      return false
    }
    if (!isNaN(permissions.alterarValorUnitarioPedido)) {
      return permissions.alterarValorUnitarioPedido === UsuarioPermissaoOpcao.Autorizado && item.promocao === 0
    }

    return item.promocao === 0
  }, [item, config, permissions])

  return <Swipeable renderRightActions={() => <View style={{ backgroundColor: textDangerColor, width: 40 }}>
    <TouchableOpacity style={{ flex: 1, alignSelf: 'center', justifyContent: 'center' }} onPress={() => onDelete(index)}>
      <Entypo name="trash" size={32} color="white" />
    </TouchableOpacity>
  </View>}
  >
    <TouchableOpacity onPress={() => setProdutoSelecionadoIndex(index === produtoSelecionadoIndex ? null : index)}>
      <ListItem2>
        {item.fotoBase64 ? (
          <View style={[styles.rowCenter, { justifyContent: 'flex-start' }]}>
            <Image source={{ uri: `data:image/jpeg;base64,${item.fotoBase64}` }} style={{ height: 80, width: 80, marginRight: 15 }} />
            <View>
              <View>
                <Label18Bold style={{ width: 220 }}>
                  {item.nome}
                </Label18Bold>
              </View>
              <View>
                <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                  <View style={{ flexDirection: 'row' }}>
                    <Label>QTD: </Label>
                    <LabelBold>{` ${NumberUtil.toDisplayNumber(item.quantidade, '', true, casasDecimais)}`}</LabelBold>
                  </View>
                </View>
                <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                  <View style={{ flexDirection: 'row' }}>
                    <Label>EM ESTOQUE: </Label>
                    <LabelBold>{` ${NumberUtil.toDisplayNumber(item.estoqueAtual, '', true, casasDecimais)}`}</LabelBold>
                  </View>
                </View>
                <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                  <View style={{ flexDirection: 'row' }}>
                    <Label>VALOR UNIT. ITEM: </Label>
                    <LabelBold>{` ${NumberUtil.toDisplayNumber(item.valorUnitario, 'R$', true)}`}</LabelBold>
                  </View>
                </View>
                {(item.descontoReal > 0) && <>
                  <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                    <View style={{ flexDirection: 'row' }}>
                      <Label>% DESCONTO UNID: </Label>
                      <LabelBold>{NumberUtil.toDisplayNumber(item.descontoPercentual, '%')}</LabelBold>
                    </View>
                  </View>
                  <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                    <View style={{ flexDirection: 'row' }}>
                      <Label>DESCONTO UNID: </Label>
                      <LabelBold>{NumberUtil.toDisplayNumber(item.descontoReal, 'R$', true)}</LabelBold>
                    </View>
                  </View>
                  <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                    <View style={{ flexDirection: 'row' }}>
                      <Label>TOTAL DESCONTO: </Label>
                      <LabelBold>{NumberUtil.toDisplayNumber(calcDescontoTotal(item.descontoReal, item.quantidade), 'R$', true)}</LabelBold>
                    </View>
                  </View>
                  <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                    <View style={{ flexDirection: 'row' }}>
                      <Label>SUB-TOTAL: </Label>
                      <LabelBold>{NumberUtil.toDisplayNumber(item.subTotal || 0, 'R$', true)}</LabelBold>
                    </View>
                  </View>
                </>}
                <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                  <View style={{ flexDirection: 'row' }}>
                    <Label>TOTAL: </Label>
                    <LabelBold>{NumberUtil.toDisplayNumber(item.valorTotal, 'R$', true)}</LabelBold>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <>
            <View style={[styles.rowCenter, { justifyContent: 'flex-start' }]}>
              {
                dark
                  ? <Image source={require('../../assets/produtoDark.png')} style={{ height: 80, width: 80, marginRight: 15 }} />
                  : <Image source={require('../../assets/produtoLight.png')} style={{ height: 80, width: 80, marginRight: 15 }} />
              }
              <View>
                <View>
                  <Label18Bold style={{ width: 220 }}>{item.nome}</Label18Bold>
                </View>
                <View>
                  <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                    <View style={{ flexDirection: 'row' }}>
                      <Label>QTD: </Label>
                      <LabelBold>{` ${NumberUtil.toDisplayNumber(item.quantidade, '', true, casasDecimais)}`}</LabelBold>
                    </View>
                  </View>
                  <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                    <View style={{ flexDirection: 'row' }}>
                      <Label>EM ESTOQUE: </Label>
                      <LabelBold>{` ${NumberUtil.toDisplayNumber(item.estoqueAtual, '', true, casasDecimais)}`}</LabelBold>
                    </View>
                  </View>
                  <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                    <View style={{ flexDirection: 'row' }}>
                      <Label>VALOR UNIT. ITEM:</Label>
                      <LabelBold>
                        {` ${NumberUtil.toDisplayNumber(item.valorUnitario, 'R$', true)}`}
                      </LabelBold>
                    </View>
                  </View>
                  {(item.descontoReal > 0) && <>
                    <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                      <View style={{ flexDirection: 'row' }}>
                        <Label>% DESCONTO UNID: </Label>
                        <LabelBold>{NumberUtil.toDisplayNumber(item.descontoPercentual, '%')}</LabelBold>
                      </View>
                    </View>
                    <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                      <View style={{ flexDirection: 'row' }}>
                        <Label>DESCONTO UNID: </Label>
                        <LabelBold>{NumberUtil.toDisplayNumber(item.descontoReal, 'R$', true)}</LabelBold>
                      </View>
                    </View>
                    <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                      <View style={{ flexDirection: 'row' }}>
                        <Label>TOTAL DESCONTO: </Label>
                        <LabelBold>{NumberUtil.toDisplayNumber(calcDescontoTotal(item.descontoReal, item.quantidade), 'R$', true)}</LabelBold>
                      </View>
                    </View>
                    <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                      <View style={{ flexDirection: 'row' }}>
                        <Label>SUB-TOTAL: </Label>
                        <LabelBold>{NumberUtil.toDisplayNumber(item.subTotal || 0, 'R$', true)}</LabelBold>
                      </View>
                    </View>
                  </>}
                  <View style={[styles.filterRow, { justifyContent: 'flex-start' }]}>
                    <View style={{ flexDirection: 'row' }}>
                      <Label>TOTAL: </Label>
                      <LabelBold>{NumberUtil.toDisplayNumber(item.valorTotal, 'R$', true)}</LabelBold>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </ListItem2>
    </TouchableOpacity>
    {produtoSelecionadoIndex === index && <ListItem3>
      <View>
        <View style={styles.verticalField}>
          <Label>QTD</Label>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <TextInputMask
              type="money"
              options={{
                precision: casasDecimais,
                separator: ',',
                delimiter: '.',
                unit: '',
                suffixUnit: ''
              }}
              ref={quantidadeRef}
              onBlur={() => {
                const valor = quantidadeRef.current.getRawValue()

                setQuantidade(valor)
              }}
              onFocus={() => {
                if (quantidade === 1) {
                  setQuantidadeStr()
                }
              }}
              onChangeText={setQuantidadeStr}
              value={quantidadeStr}
              keyboardType="numeric"
              style={[{ minWidth: 120 }, defaultStyle.input]}
            />
            <TouchableOpacity style={styles.ph5} onPress={aumentarQuantidade}>
              <AntDesign name="upcircle" size={27} color="green" />
            </TouchableOpacity>
            <TouchableOpacity disabled={quantidade <= 0} onPress={diminuirQuantidade}>
              <AntDesign style={styles.ph5} name="downcircle" size={27} color={quantidade <= 0 ? 'gray' : '#ff5232'} />
            </TouchableOpacity>
          </View>
          <LabelValidation>
            {extrairErros('quantidade')}
          </LabelValidation>
        </View>
      </View>
      <Divider style={styles.divider} />
      {
        editarValorUnitario && <>
          <View>
            <View>
              <Label>VALOR UNITÁRIO ITEM</Label>
              <TextInputMask
                type="money"
                options={{
                  precision: 2,
                  separator: ',',
                  delimiter: '.',
                  unit: '',
                  suffixUnit: ''
                }}
                onBlur={() => {
                  const valor = valorUnitarioRef.current.getRawValue()

                  setValorUnitario(valor)
                }}
                ref={valorUnitarioRef}
                onChangeText={e => setValorUnitarioStr(e)}
                value={valorUnitarioStr}
                style={defaultStyle.input}
                keyboardType="numeric" />
            </View>
          </View>
          <Divider style={styles.divider} />
        </>
      }
      {editarDesconto && <>
        <View>
          <View>
            <Label>% DESCONTO</Label>
            <TextInputMask
              type="money"
              options={{
                precision: 2,
                separator: ',',
                delimiter: '.',
                unit: '',
                suffixUnit: ''
              }}
              ref={descontoPercentualRef}
              onBlur={onBlurDescontoPercentual}
              onChangeText={setDescontoPercentualStr}
              value={descontoPercentualStr}
              style={defaultStyle.input}
              keyboardType="numeric" />
          </View>
          <LabelValidation>
            {extrairErros('descontoPercentual')}
          </LabelValidation>
        </View>
        <Divider style={styles.divider} />
        <View>
          <Label>DESCONTO(R$)</Label>
          <TextInputMask
            type={'money'}
            options={{
              precision: 2,
              separator: ',',
              delimiter: '.',
              unit: '',
              suffixUnit: ''
            }}
            ref={descontoRealRef}
            onBlur={onBlurDescontoReal}
            onChangeText={e => setDescontoRealStr(e)}
            value={descontoRealStr}
            keyboardType="numeric"
            style={defaultStyle.input} />
          <LabelValidation>
            {extrairErros('descontoReal')}
          </LabelValidation>
        </View>
        <Divider style={styles.divider} />
      </>
      }
      <View style={styles.row}>
        <View style={styles.verticalField}>
          <Label>SUBTOTAL</Label>
          <LabelBold>
            {MaskService.toMask('money', (calcTotal(valorUnitario, quantidade)), { unit: ' R$' })}
          </LabelBold>
        </View>
        <View style={styles.verticalField}>
          <Label>TOTAL</Label>
          <LabelBold>
            {MaskService.toMask('money', (calcTotal(valorUnitario, quantidade) - calcDescontoTotal(descontoReal, quantidade)), { unit: ' R$' })}
          </LabelBold>
        </View>
      </View>
      <TouchableOpacityButtonPrimary
        disabled={false}
        onSubmit={submitItem}
        label="SALVAR EDIÇÃO"
      />
    </ListItem3>}
  </Swipeable>
}

const styles = StyleSheet.create({
  ph5: {
    paddingHorizontal: 5
  },
  row: {
    display: 'flex',
    padding: 8,
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
  verticalField: {
    display: 'flex',
    flexDirection: 'column'
  },
  divider: {
    backgroundColor: '#C1BFC0',
    marginTop: 6,
    marginBottom: 4
  }
})
