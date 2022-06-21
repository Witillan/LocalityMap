import React, { useContext, useEffect, useState } from 'react'
import { Platform, SafeAreaView, ImageBackground } from 'react-native'
import ModalJogar from '../../../components/Modals/ModalJogar'
import ModalLoading from '../../../components/Modals/ModalLoading'
import CidadesDao from '../../../db/CidadeDao'
import EstadosDao from '../../../db/EstadoDao'
import Fundo from '../../../assets/FundoTelaUser.png'
import AlertButtons from '../../../components/Modals/AlertButtons'
import { AppContext } from '../../../App'

export default function Jogar() {
    const [loading, setLoading] = useState(true)
    const [abrirButtons, setAbrirButtons] = useState(false)
    const [iniciar, setIniciar] = useState(false)
    const { listaCompleta, setListaCompleta  } = useContext(AppContext)
    var objCompleto = Array()

    useEffect(() => {
        var estados = Array()
        const buscarCidades = async () => {
            await CidadesDao.GetCidades()
                .then((v) => {
                    var listaCidades = Array()
                    if (Platform.OS === 'android') {
                        listaCidades = v._array
                    } else {
                        listaCidades = v
                    }
                    estados.forEach((estado) => {
                        const cidadesEstado = listaCidades.filter(obj => obj.idEstado == estado.id)
                        var cidadeSorteada = cidadesEstado.slice().sort(() => 0.5 - Math.random()).slice(0, 1)
                        const cidadesAleatórias = (listaCidades.filter(obj => obj.idEstado != estado.id)).slice().sort(() => 0.5 - Math.random()).slice(0, 3)
                        const listaCidadesUnidas = cidadesAleatórias.concat(cidadeSorteada)
                        const sortearCidadesUnidas = listaCidadesUnidas.slice().sort(() => 0.5 - Math.random()).slice(0, 4)

                        const obj = { estado: { id: estado.id, nome: estado.nome }, cidades: sortearCidadesUnidas }
                        objCompleto.push(obj)
                    })
                    setListaCompleta(objCompleto)
                })
                .catch((e) => console.log(e.message))
                .finally(() => { setLoading(false), setAbrirButtons(true), setIniciar(false) })
        }

        const buscarEstados = async () => {
            setLoading(true)
            await EstadosDao.GetEstados()
                .then((v) => {

                    var listaEstados = Array()
                    if (Platform.OS === 'android') {
                        listaEstados = v._array
                    } else {
                        listaEstados = v
                    }
                    var estadosSorteados = listaEstados.slice().sort(() => 0.5 - Math.random()).slice(0, 10)
                    estados = estadosSorteados
                    setTimeout(() => buscarCidades(), 5000)
                })
        }
        buscarEstados()
    }, [])

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ImageBackground source={Fundo} style={{ flex: 1, padding: 10 }}>
                <ModalLoading loading={loading} message="Escolhendo Cidades" />
                <AlertButtons
                    visible={abrirButtons}
                    title={"Iniciar jogo"}
                    subTitle={'Você está prestes a iniciar o jogo, clique em iniciar para começar o jogo!'}
                    buttons={[
                        {
                            label: 'Iniciar',
                            onPress: (r) => {
                                setIniciar(true)
                                setAbrirButtons(r)
                            }
                        }
                    ]}
                />
                <ModalJogar loading={iniciar} onClose={setIniciar} value={objCompleto} />
            </ImageBackground>
        </SafeAreaView>
    )
}