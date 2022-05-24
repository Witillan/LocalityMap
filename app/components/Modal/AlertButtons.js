import React from 'react'
import { Modal, StyleSheet, View, TouchableOpacity } from 'react-native'
import { Label, Label18Bold, LabelPrimary, ListItem1, useDefaultStyleSheet } from '../style'

export default function ({ visible, title, subTitle, buttons }) {
  const { backgroundColorFundoModal } = useDefaultStyleSheet()
  return (
        <Modal animationType={'none'} transparent={true} visible={visible}>
            <View style={[styles.modal, { backgroundColor: backgroundColorFundoModal }]}>
                <ListItem1>
                    <ListItem1 style={styles.loadingModal}>
                        <View style={styles.title}>
                            <Label18Bold style={styles.text18}>{title}</Label18Bold>
                            <Label style={styles.text15}>{subTitle}</Label>
                        </View>
                        <View style={styles.buttons}>
                            {buttons.map((btn, index) => (
                                <TouchableOpacity key={`button-${index}-${btn.label}`} onPress={() => {
                                  if (btn.label === 'Cancelar') {
                                    return btn.onPress(false)
                                  }
                                  return btn.onPress(false)
                                }}
                                    style={{ backgroundColor: 'transparent', marginVertical: 2, padding: 5 }}>
                                    <LabelPrimary style={{ fontWeight: 'bold' }}>{btn.label.toUpperCase()}</LabelPrimary>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ListItem1>
                </ListItem1>
            </View>
        </Modal>
  )
};
const styles = StyleSheet.create({
  modal: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
  loadingModal: {
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20
  },
  title: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    justifyContent: 'flex-start'
  },
  text15: {
    fontSize: 15,
    paddingTop: 10,
    paddingBottom: 15
  },
  text18: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingTop: 5
  },
  buttons: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center'
  }
})
