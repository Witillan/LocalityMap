import { FontAwesome5 } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useDefaultStyleSheet } from '../style'

const FloatingButtonScroll = (props) => {
  const { textPrimaryDarkColor, textPrimaryLightColor } = useDefaultStyleSheet()
  return (
        <TouchableOpacity onPress={props.onPress} style={props.style}>
            <View style={[styles.plus, { borderRadius: 50, backgroundColor: textPrimaryDarkColor, borderColor: textPrimaryDarkColor }]} >
                <FontAwesome5 name={props.icon} size={38} color={textPrimaryLightColor} />
            </View>
        </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  plus: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderWidth: 1
  }
})

export default FloatingButtonScroll
