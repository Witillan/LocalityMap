import React from 'react'
import { StyleSheet } from 'react-native'

import TouchableOpacityButtonDanger from '../../components/Buttons/TouchableOpacityButtonDanger'
import { AuthContext } from '../../components/navigation/contexts'
import { Container1, Label } from '../../components/style'

const Logoff = () => {
  const { signOut } = React.useContext(AuthContext)

  return <Container1 style={styles.container}>
    <Container1 style={styles.textContainer}>
      <Label style={styles.text1}>Você deseja sair?</Label>
      <Label style={styles.text2}>Para fazer login novamente você deve estar conectado com a internet.</Label>
      <TouchableOpacityButtonDanger
        disabled={false}
        onSubmit={signOut}
        label="SAIR AGORA"
      />
    </Container1>
  </Container1>
}

const styles = StyleSheet.create({
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 40
  },
  text1: {
    fontSize: 26,
    marginBottom: 5
  },
  text2: {
    fontSize: 20,
    marginBottom: 15,
    textAlign: 'center'
  }
})

export default Logoff
