import { FontAwesome5 } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import React, { useCallback, useContext, useState } from 'react'
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { Divider } from 'react-native-elements'
import FloatingButtonCarrinho from '../../../components/Buttons/FloatingButtonNumber'
import TouchableOpacityButtonDanger from '../../../components/Buttons/TouchableOpacityButtonDanger'
import TouchableOpacityButtonSuccess from '../../../components/Buttons/TouchableOpacityButtonSuccess'
import AlertButtons from '../../../components/Modal/AlertButtons'
import { CompraContext } from '../../../components/navigation/contexts'
import { Container1, FlatList1, ScrollView1, useDefaultStyleSheet } from '../../../components/style'
import ValidationItemSchema from '../../../components/Validation/ItemNewCompraValidation'
import { createUUID } from '../../../util/guid'
import { ItemCarrinho } from '../itens'

export default () => {
  const { defaultStyle } = useDefaultStyleSheet()
  const { selecionados, setSelecionados, produtoSelecionadoIndex, setProdutoSelecionadoIndex, setValidation, validation } = useContext(CompraContext)

  const [abrirButtons, setAbrirButtons] = useState(false)

  const navigation = useNavigation()

  const total = () => selecionados?.map((q) => q.valorTotal).reduce((prev, curr) => prev + curr, 0)

  const removerItemSelecionado = useCallback((index) => {
    const novosSelecionados = [...selecionados]
    novosSelecionados.splice(index, 1)
    setSelecionados(novosSelecionados)
  }, [selecionados, setSelecionados])
  const removeAll = () => {
    setSelecionados([])
  }

  const editarItem = useCallback((obj, index) => {
    const novosSelecionados = [...selecionados]
    novosSelecionados[index] = { ...novosSelecionados[index], ...obj }
    setSelecionados(novosSelecionados)
    setProdutoSelecionadoIndex(null)
  }, [selecionados, setProdutoSelecionadoIndex, setSelecionados])

  const adicionarTodos = () => {
    let count = 0
    let firstError = null

    // // Aqui tratamos um cenário onde existe o mesmo produto com desconto diferente
    const idsProdutos = [...new Set(selecionados.map(item => item.produtoId))]
    const selecionadosAgrupados = idsProdutos.map(idProduto => {
      const itensDoProduto = selecionados.filter(q => q.produtoId === idProduto)
      return itensDoProduto.reduce((prev, curr) => ({ ...prev, quantidade: prev.quantidade + curr.quantidade }))
    })

    selecionadosAgrupados.forEach((obj, index) => {
      ValidationItemSchema
        .validate(obj, { abortEarly: true })
        .then(() => {
          count++

          if (count === selecionadosAgrupados.length && !firstError) {
            navigation.navigate('NewCompra')
          }
        })
        .catch((e) => {
          if (firstError) {
            return
          }
          firstError = e

          setProdutoSelecionadoIndex(index)
          Alert.alert('Erro', `Verifique o campo ${e.path.toUpperCase()} do(s) item(s) que possui o produto ${e.value.nome.toUpperCase()}`)
        })
    })
  }

  const renderItem = useCallback(({ item, index }) => <ItemCarrinho
    produtoSelecionadoIndex={produtoSelecionadoIndex}
    setProdutoSelecionadoIndex={setProdutoSelecionadoIndex}
    submit={obj => editarItem(obj, index)}
    onDelete={() => removerItemSelecionado(index)}
    item={item}
    index={index}
    setValidation={setValidation}
    validation={validation}
  />, [editarItem, produtoSelecionadoIndex, removerItemSelecionado, setProdutoSelecionadoIndex, setValidation, validation])

  if (!selecionados?.length) {
    return <SafeAreaView style={[defaultStyle.background1, { flex: 1 }]}>
      <View style={[{ paddingTop: 20 }, styles.cartEmpty, defaultStyle.background1]}>
        <FontAwesome5 name="cart-arrow-down" size={130} color="red" />
        <Text style={[styles.fontSize18, styles.textBold, styles.marginTop20, defaultStyle.text]}>Não há itens selecionados</Text>
      </View>
      <FloatingButtonCarrinho
        number={selecionados?.length}
        icon="shoppingcart"
        style={styles.floatingBtn}
        onPress={() => {
          setProdutoSelecionadoIndex(null)
          navigation.navigate('ProdutosCompra')
        }}
        total={total()}
      />
    </SafeAreaView>
  }

  return <Container1>
    <Container1 style={{ marginTop: 10, paddingBottom: 5, paddingTop: 2 }}>
      <ScrollView1>
        <FlatList1
          data={selecionados}
          renderItem={renderItem}
          keyExtractor={createUUID}
          ItemSeparatorComponent={() => <Divider style={defaultStyle.lineDivider} />}
        />
        <View style={{ paddingTop: 30, paddingBottom: 100, marginHorizontal: 30 }}>
          <TouchableOpacityButtonSuccess
            disabled={false}
            onSubmit={adicionarTodos}
            label="ADICIONAR TODOS"
            style={{ marginBottom: 20 }}
          />
          <TouchableOpacityButtonDanger
            disabled={false}
            onSubmit={() => setAbrirButtons(true)}
            label="REMOVER TODOS"
          />
        </View>
      </ScrollView1>
    </Container1>
    <FloatingButtonCarrinho
      number={selecionados?.length}
      icon="shoppingcart"
      style={styles.floatingBtn}
      onPress={() => {
        setProdutoSelecionadoIndex(null)
        navigation.navigate('ProdutosCompra')
      }}
      total={total()}
    />
    <AlertButtons
      visible={abrirButtons}
      title={'Remover itens'}
      subTitle={'Deseja mesmo remover todos os itens?'}
      buttons={[
        {
          label: 'Confirmar',
          onPress: (r) => {
            removeAll()
            setAbrirButtons(r)
          }
        },
        { label: 'Cancelar', onPress: (r) => setAbrirButtons(r) }
      ]}
    />
  </Container1>
}

const styles = StyleSheet.create({
  textBold: {
    fontWeight: 'bold'
  },
  fontSize18: {
    fontSize: 18
  },
  lineDivider: {
    backgroundColor: '#C1BFC0',
    marginTop: 6,
    marginBottom: 4,
    borderWidth: 1
  },
  buttonSuccess: {
    margin: 5
  },
  floatingBtn: {
    position: 'absolute',
    bottom: 5,
    width: '100%',
    height: 50
  },
  marginTop20: {
    marginTop: 20
  },
  cartEmpty: {
    marginVertical: 100,
    padding: 50,
    paddingHorizontal: 70,
    flex: 1,
    alignItems: 'center',
    alignSelf: 'center'
  }
})
