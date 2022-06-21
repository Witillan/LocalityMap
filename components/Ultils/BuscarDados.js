import React, { useEffect, useState } from "react"
import axios from "axios"
import { View } from "react-native"
import ModalLoading from "../Modals/ModalLoading"
import PaisDao from "../../db/PaisDao"
import EstadosDao from "../../db/EstadoDao"
import CidadesDao from "../../db/CidadeDao"

export default function BuscarDados() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")

    const [paises, setPaises] = useState([])
    const [estados, setEstatos] = useState([])
    const [cidades, setCidades] = useState([])

    const buscarPaises = async () => {
        axios.get("https://servicodados.ibge.gov.br/api/v1/paises")
            .then((r) => {
                if (r.data.length > 0) {
                    const salvar = async () => {
                        r.data.map((v) => {
                            const obj = {
                                id: v.id["M49"],
                                sigla: v.id["ISO-3166-1-ALPHA-2"],
                                nome: v.nome.abreviado
                            }
                            PaisDao.Insert(obj)
                        });
                    }
                    salvar()
                }
            })
            .catch((e) => {
                console.log(`Erro ao buscar cidades: ${e.message}`)
            })
    }

    const buscarEstados = async () => {
        axios.get("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
            .then((r) => {
                if (r.data.length > 0) {
                    const salvar = async () => {
                        r.data.map((v) => {
                            const obj = {
                                id: v.id,
                                idRegiao: v.regiao.id,
                                idPais: 76,
                                sigla: v.sigla,
                                nome: v.nome
                            }
                            EstadosDao.Insert(obj)
                        });
                    }
                    salvar()
                }
            })
            .catch((e) => {
                console.log(`Erro ao buscar cidades: ${e.message}`)
            })
    }

    const buscarCidades = async () => {
        axios.get("https://servicodados.ibge.gov.br/api/v1/localidades/municipios")
            .then((r) => {
                if (r.data.length > 0) {
                    const salvar = async () => {
                        r.data.map((v) => {
                            const obj = {
                                id: v.id,
                                idRegiao: v.microrregiao.mesorregiao["UF"].regiao.id,
                                idEstado: v.microrregiao.mesorregiao["UF"].id,
                                nome: v.nome
                            }
                            CidadesDao.Insert(obj)
                        });
                    }
                    salvar()
                }
            })
            .catch((e) => {
                console.log(`Erro ao buscar cidades: ${e.message}`)
            })
    }

    useEffect(() => {
        setLoading(true)
        setMessage("Buscando Paises")
        buscarPaises()
        setMessage("Buscando Estados")
        buscarEstados()
        setMessage("Buscando Cidades")
        buscarCidades()
        setTimeout(() => setLoading(false), 5000)
    }, [])

    useEffect(() => {
        CidadesDao.GetCidades()
        .then((r) => {
            console.log(r)
        })
    }, [])

    return (
        <View>
            <ModalLoading
                loading={loading}
                onClose={setLoading}
                message={message}
            />
        </View>
    )
}