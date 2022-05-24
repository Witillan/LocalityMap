import DateTimePicker from '@react-native-community/datetimepicker'
import moment from 'moment'
import React, { useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'

import { ListItem2, ContainerPicker, Label, LabelRequired, LabelValidation } from '../style'

export default function ({ value, enabled = true, hideLabels = false, onChange, validation, ...rest }) {
  const [mode, setMode] = useState('date')
  const [show, setShow] = useState(false)

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

  if (Platform.OS === 'ios') {
    return <>
      <ListItem2 style={{ padding: 5 }}>
        {!hideLabels && <View style={styles.rowText}>
          <Label>Data</Label>
          <LabelRequired>*</LabelRequired>
        </View>}
        <DateTimePicker
          {...rest}
          disabled={!enabled}
          locale="pt-BR"
          testID="dateTimePicker"
          value={value}
          mode="datetime"
          is24Hour={true}
          onChange={onChange}
        />
        <LabelValidation>
          {extrairErros('data')}
        </LabelValidation>
      </ListItem2>
    </>
  }

  const showMode = (currentMode) => {
    setShow(true)
    setMode(currentMode)
  }

  const showDatepicker = () => {
    showMode('date')
  }

  const showTimepicker = () => {
    showMode('time')
  }

  return <>
    <View style={styles.rowHorizontal}>
      <View>
        {!hideLabels && <View style={styles.rowText}>
          <Label>Data </Label>
          <LabelRequired>*</LabelRequired>
        </View>}
        <ContainerPicker disabled={!enabled} onPress={showDatepicker} style={styles.date}>
          <Label>{`${moment(value).format('DD/MM/YYYY')}`}</Label>
        </ContainerPicker>
        <LabelValidation>
          {extrairErros('data')}
        </LabelValidation>
      </View>
      <View>
        {!hideLabels && <View style={styles.rowText}>
          <Label>Hora </Label>
          <LabelRequired>*</LabelRequired>
        </View>}
        <ContainerPicker disabled={!enabled} onPress={showTimepicker} style={styles.time}>
          <Label>{`${moment(value).format('HH:mm')}`}</Label>
        </ContainerPicker>
      </View>
    </View>
    <View>
      {show && (
        <DateTimePicker
          disabled={!enabled}
          testID="dateTimePicker"
          value={value}
          mode={mode}
          is24Hour={true}
          onChange={(ev, value) => {
            setShow(false)

            if (!value) return

            onChange(ev, value)
          }}
        />
      )}
    </View>

  </>
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16
  },
  date: {
    minWidth: 150,
    height: 35,
    padding: 6
  },
  time: {
    width: 150,
    height: 35,
    padding: 6
  },
  rowHorizontal: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  rowText: {
    flexDirection: 'row'
  }
})
