import { FontAwesome } from '@expo/vector-icons'
import React from 'react'
import { TouchableOpacity } from 'react-native'

const FloatingButtonShare = (props) => {
  return (
        <TouchableOpacity onPress={props.onPress} style={props.style} disabled={props.disabled}>
            <FontAwesome name="share-alt-square" size={70} color="#3BB54A" />
        </TouchableOpacity>
  )
}

export default FloatingButtonShare
