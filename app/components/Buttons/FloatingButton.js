import { AntDesign } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

const FloatingButton = (props) => {
  return (
        <TouchableOpacity onPress={props.onPress} style={props.style}>
            <View style={styles.plus} >
                <AntDesign name={props.icon} size={38} color="#FFFFFF" />
            </View>
        </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  plus: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3BB54A',
    width: 60,
    height: 60,
    borderRadius: 45
  }
})

export default FloatingButton
