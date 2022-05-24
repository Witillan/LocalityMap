import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import LogDAO from '../db/LogDao'

export default class ErrorContainer extends React.Component {
  constructor (props) {
    super(props)
    this.state = { error: null }
  }

  componentDidCatch (error, errorInfo) {
    const resumedLog = errorInfo.componentStack.length > 300 ? errorInfo.componentStack.substring(0, 300) : errorInfo.componentStack
    LogDAO.GravarLog(`${error.toString()} - ${resumedLog}`)

    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error
    })
  }

  render () {
    if (this.state.errorInfo) {
      // Error path
      return <View style={styles.container}>
        <MaterialIcons name="error" size={32} color="red" />
        <Text style={styles.text22}>Ocorreu um erro no app</Text>
        <Text style={styles.text18}>feche o Venum e abra novamente</Text>
        {this.state.error && <Text style={[styles.text18, styles.mt10]}>{this.state.error.toString()}</Text>}
      </View>
    }
    // Normally, just render children
    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50
  },
  mt10: {
    marginTop: 10
  },
  text18: {
    fontSize: 18
  },
  text22: {
    fontSize: 22
  }
})
