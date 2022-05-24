import { AntDesign } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

const FloatingButtonDelete = (props) => {
  return (
        <TouchableOpacity onPress={props.onPress} style={props.style}>
            <View style={styles.buttonDelete}>
                <AntDesign name="delete" size={50} color="#FFFFFF" />
            </View>
        </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  buttonDelete: {
    backgroundColor: 'red',
    borderRadius: 10,
    width: 60,
    height: 60,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default FloatingButtonDelete
