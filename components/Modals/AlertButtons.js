import React from 'react'
import { Modal, StyleSheet, View, TouchableOpacity, Text } from 'react-native'

export default function ({ visible, title, subTitle, buttons }) {
  return (
        <Modal animationType={'none'} transparent={true} visible={visible}>
            <View style={styles.modal}>
                <View style={styles.modalView}>
                    <View style={styles.loadingModal}>
                        <View style={styles.title}>
                            <Text style={styles.text18}>{title}</Text>
                            <Text style={styles.text15}>{subTitle}</Text>
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
                                    <Text style={{ fontWeight: 'bold' }}>{btn.label.toUpperCase()}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
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
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
},
})
