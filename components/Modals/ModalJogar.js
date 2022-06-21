import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { AppContext } from '../../App';
import ModalVencedor from './ModalVencedor';

export default function ({ loading, onClose, value }) {
    const navigate = useNavigation()
    const { listaCompleta, setListaCompleta } = useContext(AppContext)
    const [proximo, setProximo] = useState(0)
    const [corButton, setCorButton] = useState(['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'])
    const [contadorAcerto, setContadorAcerto] = useState(0)
    const [acabou, setAcabou] = useState(false)
    const [nome, setNome] = useState('')

    const resposta = (posicaoCidade) => {
        if (listaCompleta[proximo]?.cidades[posicaoCidade]?.idEstado == listaCompleta[proximo]?.estado?.id) {
            var cores = [...corButton]
            cores[posicaoCidade] = 'green'
            setCorButton(cores)
            setContadorAcerto(contadorAcerto + 1)
            if (proximo == 9) {
                setAcabou(true)
                return
            }
            setTimeout(() => setProximo(proximo + 1), 2000)
        } else if (listaCompleta[proximo]?.cidades[posicaoCidade]?.idEstado != listaCompleta[proximo]?.estado?.id) {
            var cores = [...corButton]
            cores[posicaoCidade] = 'red'
            setCorButton(cores)
            if (proximo == 9) {
                setAcabou(true)
                return
            }
            setTimeout(() => setProximo(proximo + 1), 2000)
        }
    }

    useEffect(() => {
        setProximo(0)
        if (nome) return
        try {
            let nomeStorage = ''
            const getNome = async () => {
                nomeStorage = await AsyncStorage.getItem('@nomeusuario')
                setNome(nomeStorage)
            }
            getNome()
        } catch (error) {
            console.log("Erro ao obter nome do jogador: " + error)
        }
    }, [])

    useEffect(() => {
        setCorButton(['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'])
    }, [proximo])

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={loading}
        >
            <View style={styles.centeredView}>
                <View style={[styles.modalView, { flex: 1, backgroundColor: "#3ECB67", justifyContent: 'center' }]}>
                    <View style={styles.itens}>
                        <Text style={styles.itens}>{`Qual das cidades abaixo pertencem a ${listaCompleta[proximo]?.estado?.nome || '---'}?`}</Text>
                    </View>
                </View>
                <View style={[styles.modalView, { flex: 2, backgroundColor: "#2B44FF", justifyContent: 'center' }]}>
                    <View style={styles.itens}>
                        <TouchableOpacity
                            onPress={() => resposta(0)}
                            style={[styles.button, { backgroundColor: corButton[0] }]}>
                            <Text style={{ width: '100%' }}>{listaCompleta[proximo]?.cidades[0]?.nome}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => resposta(1)}
                            style={[styles.button, { backgroundColor: corButton[1] }]}>
                            <Text>{listaCompleta[proximo]?.cidades[1]?.nome}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => resposta(2)}
                            style={[styles.button, { backgroundColor: corButton[2] }]}>
                            <Text>{listaCompleta[proximo]?.cidades[2]?.nome}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => resposta(3)}
                            style={[styles.button, { backgroundColor: corButton[3] }]}>
                            <Text>{listaCompleta[proximo]?.cidades[3]?.nome}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.modalView, { flex: 1, backgroundColor: "#2B44FF", justifyContent: 'center' }]}>
                    {/* <View style={styles.itens}>
                        <TouchableOpacity
                            disabled={proximo >= 9}
                            onPress={() => {
                                if (proximo <= 9) setProximo(proximo + 1)
                            }}
                            style={[styles.buttonNext, { backgroundColor: proximo == 9 ? '#CCCCCC' : '#3ECB67' }]}>
                            <Text>PROXIMO</Text>{console.log(listaCompleta.length + " - " + proximo)}
                        </TouchableOpacity>
                    </View> */}
                </View>
            </View>
            <ModalVencedor
                visible={acabou}
                message={`${nome} Você acertou ${contadorAcerto} ${contadorAcerto <= 1 ? 'cidade' : 'cidades'}!`}
                onClose={() => { setAcabou(false), setProximo(0), setContadorAcerto(0), setNome(''), setListaCompleta([]), navigate.navigate("Quizzes") }}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    centeredViewModal: {
        justifyContent: "center",
        alignItems: "center"
    },
    itens: {
        textAlign: "center",
        fontWeight: "bold",
        marginBottom: 10,
        alignItems: "center"
    },
    modalView: {
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        width: '100%',
        height: '100%'
    },
    modalText: {
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center"
    },
    button: {
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 10,
        margin: 5,
        width: '100%',
        maxWidth: 500
    },
    buttonNext: {
        backgroundColor: '#3ECB67',
        color: 'white',
        borderRadius: 5,
        padding: 10,
        margin: 5,
        width: '100%',
        maxWidth: 200
    }
});