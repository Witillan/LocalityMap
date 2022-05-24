import { AntDesign } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { NumberUtil } from '../../util/number'

const FloatingButtonCarrinho = (props) => {
  return (
        <TouchableOpacity onPress={props.onPress} style={props.style}>
            <View style={styles.view} >
                <Text style={styles.number}>{props.number} itens adicionados</Text>
                <View style={styles.totalView}>
                    <Text style={styles.totalSuccess}>Total:</Text>
                    <Text style={styles.totalSuccess}>{NumberUtil.toDisplayNumber(props.total, 'R$', true, 2)}</Text>
                    <AntDesign name={props.icon} size={32} color="#FFFFFF" />
                </View>
            </View>
        </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  view: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0A7AC3',
    padding: 10
  },
  number: {
    fontSize: 15,
    color: 'white'
  },
  totalSuccess: {
    paddingHorizontal: 5,
    fontSize: 15,
    color: 'white',
    fontWeight: 'bold'
  },
  totalView: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
})

export default FloatingButtonCarrinho
