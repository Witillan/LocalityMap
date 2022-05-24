import * as FileSystem from 'expo-file-system'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import moment from 'moment'
import { Alert } from 'react-native'

import PedidoDAO from '../../db/PedidoDao'
import { formatarCpfOuCnpj } from '../../util/formatString'
import { NumberUtil } from '../../util/number'

const onSharing = async (tempId, empresa, userInfo) => {
  try {
    PedidoDAO.GetOnePrint(tempId).then(async obj => {
      const qtdItem = obj.itens.length
      const html =
                `
                <!DOCTYPE html>
                <html lang="pt">
                <title>Pedido Alpha-Vendas</title>
                <head>
                    <style type="text/css">
                        .logo {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        .nav {
                            background-color: #0A9ADC;
                            padding-top: 20px;
                            margin: -10px;
                            border-radius: 8px;
                        }
                        .titulo {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            color: #FFFFFF;
                            font-size: 20px;
                        }
                        .venum {
                            margin-top: 0;
                            margin-bottom: 0;
                            padding-left: 5px;
                            font-family: "Roboto";
                        }
                        .dataAndTime {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            color: #FFFFFF;
                            padding-bottom: 10px;
                            padding-top: 8px;
                        }
                        .row {
                            padding: 5px 0px 5px 0px;
                            display: flex;
                            flex-direction: row;
                            justify-content: space-between;
                        }
                        .row-total {
                            flex-direction: row;
                        }
                        .div-right {
                            display: flex;
                            justify-content: flex-start;
                            padding-left: 10px;
                        }
                        .div {
                            display: flex;
                        }
                        .div-data {
                            margin-top: 20px;
                        }
                        .div-obs {
                            margin-left: 5px;
                        }
                        .column {
                            margin-right: 10px;
                            display: flex;
                            flex-direction: column;
                        }
                        .div-table {
                            margin-bottom: 5px;
                        }
                        .text {
                            margin-bottom: 5px;
                            padding-right: 5px;
                            font-weight: bold;
                            color: #0A7AC3;
                            font-size: 20px;
                        }
                        .total {
                            display: flex;
                            flex-direction: row;
                            justify-content: space-between;
                            padding: 5px;
                            font-weight: bold;
                            color: #0A7AC3;
                            font-size: 30px;
                            background-color: #DCDCDC;
                            border-radius: 5px;
                        }
                        .qtdItem {
                            display: flex;
                            flex-direction: row;
                            margin-bottom: 20px;
                            padding-left: 5px;
                            color: #0A7AC3;
                            font-size: 20px;
                        }
                        .value {
                            margin-bottom: 5px;
                            padding-right: 5px;
                            color: #0A7AC3;
                            font-size: 20px;
                        }
                        .value-obs {
                            margin-bottom: 5px;
                            padding-right: 5px;
                            color: #0A7AC3;
                            font-size: 20px;
                            width: 250px;
                            word-wrap: break-word;
                        }
                        table,
                        th,
                        td {
                            border: 1px solid #0A7AC3;
                            border-collapse: collapse;
                        }
                        td {
                            padding: 5px;
                            text-align: left;
                            color: #0A7AC3;
                        }
                        th {
                            padding: 5px;
                            text-align: left;
                        }
                        thead {
                            background-color: #0A7AC3;
                            opacity: 0.8;
                            color: #FFFFFF;
                        }
                        tfoot {
                            color: #0A7AC3;
                        }
                    </style>
                </head>
                <body>
                    <div class="nav">
                        <div class="logo">
                            <img width="70px" height="70px" src='https://drive.google.com/uc?id=1M5kVsdl7HA6uESLIN00d8o6XD8iKMreP'
                                alt="Logo_AlphaExpress">
                        </div>
                        <strong class="titulo">
                        ${empresa.nome} - ${obj.fechado === 0 ? 'Orçamento' : 'Fechado'}
                        </strong>
                        <strong class="titulo">
                            PEDIDO
                        </strong>
                        <div class="dataAndTime">
                        ${moment(obj.dataEHora).format('DD/MM/YYYY')} ás ${moment(obj.dataEHora).format('HH:mm')}
                        <p class="venum">- Via App Venum </p>
                        </div>
                    </div>
                    <div class="div-data">
                        <div class="row">
                            <div>
                                <div class="div">
                                    <strong class="text">
                                        Razão Social:
                                    </strong>
                                    <div class="value">
                                        ${obj.cliente.nomeRazao}
                                    </div>
                                </div>
                                <div class="div">
                                    <div class="text">
                                        Fantasia:
                                    </div>
                                    <div class="value">
                                        ${obj.cliente.apelido || obj.cliente.nomeRazao}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div class="div">
                                    <div class="text">
                                        Usuario:
                                    </div>
                                    <div class="value">
                                        ${userInfo.nome}
                                    </div>
                                </div>
                                ${obj.numeroPedido ? `<div class="div">
                                    <strong class="text">
                                        N° Pedido:
                                    </strong>
                                    <div class="value">
                                        ${obj.numeroPedido}
                                    </div>
                                </div>` : '<div></div>'}
                            </div>
                        </div>
                        <div class="div">
                            <div class="text">
                                CNPJ/CPF:
                            </div>
                            <div class="value">
                                ${formatarCpfOuCnpj(obj.cliente.cpf)}
                            </div>
                        </div>
                        <div class="div">
                            <div class="text">
                                Endereço:
                            </div>
                            <div class="value">
                                ${obj.cliente.endereco}${obj.cliente.numero ? ', n° ' + obj.cliente.numero : ' '}${obj.cliente.bairro ? ', ' + obj.cliente.bairro : ' '}${obj.cliente.complemento ? ', ' + obj.cliente.complemento : ' '}
                            </div>
                        </div>
                        <div class="div">
                            <div class="text">
                                Cidade/UF:
                            </div>
                            <div class="value">
                                ${obj.cidade.nome} (${obj.cidade.uf})
                            </div>
                        </div>
                    </div>
                    <div class="div-table">
                        <table style="width:100%">
                            <thead>
                                <tr>
                                    <th style="text-align:center">Nome</th>
                                    <th style="text-align:center">Marca</th>
                                    <th style="text-align:center">Qtd</th>
                                    <th style="text-align:center">Und</th>
                                    <th style="text-align:center">Vlr. Unit.</th>
                                    <th style="text-align:center">Desc. Unit</th>
                                    <th style="text-align:center">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${obj.itens.map(item => {
                    const casasDecimais = item.fracionado.toLowerCase() === 'sim' ? 2 : 0

                    return `<tr>
                                            <td style="text-align:left">${item.nomeProduto}</td>
                                            <td style="text-align:left">${item.nomeMarcaProduto}</td>
                                            <td style="text-align:right">${NumberUtil.toDisplayNumber(item.quantidade, '', true, casasDecimais)}</td>
                                            <td style="text-align:left">${item.nomeUnidadeProduto}</td>
                                            <td style="text-align:right">${NumberUtil.toDisplayNumberLeft(item.valorUnitario, 'R$')}</td>
                                            <td style="text-align:right">${NumberUtil.toDisplayNumberLeft(item.descontoReal, 'R$')}</td>
                                            <td style="text-align:right">${NumberUtil.toDisplayNumberLeft((item.valorUnitario * item.quantidade) - item.descontoReal, 'R$')}</td>
                                    </tr>`
}).join('')}
                        </tbody>
                        </table>
                    </div>
                    <div class="qtdItem">
                        <div class="text">
                            Itens do pedido: 
                        </div>
                        ${qtdItem} item(s)
                    </div>
                    <div class="row">
                        <div class="div">
                            <div class="div-obs">
                                <div class="text">
                                    Observações:
                                </div>
                                <div class="value-obs">
                                    ${obj.anotacoes ? obj.anotacoes : 'Sem observações'}.
                                </div>
                            </div>
                        </div>
                        <div class="div">
                            <div class="column">
                                <div class="row">
                                    <div class="text">
                                        Forma de Pagamento:
                                    </div>
                                    <div class="value">
                                        ${obj.formaPagamento[0].nome}
                                    </div>
                                </div>
                                <!--<div class="row">
                                    <div class="text">
                                        Vlr Parcelas:
                                    </div>
                                    <div class="value">
                                        8,50 R$
                                    </div>
                                </div>-->
                                <div class="row">
                                    <div class="text">
                                        SubTotal:
                                    </div>
                                    <div class="value">
                                        ${NumberUtil.toDisplayNumberLeft(obj.subTotal, 'R$')}
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="text">
                                        Desconto dos itens:
                                    </div>
                                    <div class="value">
                                        ${NumberUtil.toDisplayNumberLeft(NumberUtil.mapSum(obj.itens.map(item => item.descontoReal)), 'R$')}
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="text">
                                        Desconto da venda:
                                    </div>
                                    <div class="value">
                                        ${NumberUtil.toDisplayNumberLeft(obj.descontoReal, 'R$')}
                                    </div>
                                </div>
                                <div class="total">
                                    <div>
                                        Total:
                                    </div>
                                    <div>
                                        ${NumberUtil.toDisplayNumberLeft(obj.total, 'R$')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `

      const filePath = await Print.printToFileAsync({ html })

      const pdfName = `${filePath.uri.slice(0, filePath.uri.lastIndexOf('/') + 1)}Pedido_${moment(obj.dataEHora).format('DD-MM-YYYY')}_${(obj.cliente.apelido || obj.cliente.nomeRazao).replace(/\s/g, '_')}.pdf`

      await FileSystem.moveAsync({
        from: filePath.uri,
        to: pdfName
      })

      await Sharing.shareAsync(pdfName)
    })
  } catch (error) {
    Alert.alert('Erro', error.message)
  }
}

export default onSharing
