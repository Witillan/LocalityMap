import { MaterialCommunityIcons } from '@expo/vector-icons'
import React from 'react'
import { ButtonResetFilter } from '../style'

export default function ({ onSubmit, ...rest }) {
  return <ButtonResetFilter {...rest} onPress={() => onSubmit()}>
        <MaterialCommunityIcons name="filter-remove-outline" size={24} color={'white'} />
    </ButtonResetFilter>
}
