import AsyncStorage from '@react-native-async-storage/async-storage'
import CidadeDAO from './CidadeDao'
import ClienteDAO from './ClienteDao'
import FormaPagamentoDAO from './FormaPagamentoDao'
import Sqlite from './Sqlite'

export default class PedidoDAO {
  static AddOrReplaceFromAPI (values) {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        values.forEach(item => {
          const parameters = [
            item.tempId || item.id,
            item.id,
            item.idAlphaExpress,
            item.numeroPedido,
            item.clienteId,
            item.dataEHora,
            item.subTotal,
            item.descontoReal,
            item.descontoPercentual,
            item.total,
            item.anotacoes,
            item.sincronizado,
            item.subEmpresaId,
            item.formaPagamentoId,
            item.usuarioCriacaoId,
            item.usuarioAlteracaoId,
            1,
            item.latitude,
            item.longitude,
            item.precisaoLocalizacao,
            item.idAparelho,
            item.empresaId,
            item.dataCriacao,
            item.dataAlteracao,
            item.revertido === true
          ]
          const sqlPedido = `insert or replace into Pedido values (${parameters.map(() => '?').join(',')})`
          tx.executeSql(
            sqlPedido,
            parameters,
            () => {
              item.itens.forEach(subItem => {
                const parameters = [
                  subItem.tempId || subItem.id,
                  subItem.id,
                  subItem.idAlphaExpress,
                  subItem.tempPedidoId || subItem.pedidoId,
                  subItem.pedidoId,
                  subItem.produtoId,
                  subItem.quantidade,
                  subItem.valorUnitario,
                  subItem.descontoReal,
                  subItem.descontoPercentual,
                  subItem.valorTotal,
                  subItem.empresaId
                ]

                const sqlPedidoItem = `insert or replace into PedidoItem values (${parameters.map(() => '?').join(',')})`

                tx.executeSql(sqlPedidoItem, parameters)
              })
            })
        })
      }, reject, resolve)
    })
  }

  static Save (pedido) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('UserInfo').then(userInfoStr => {
        const userInfo = JSON.parse(userInfoStr)

        this.RemoveItens(pedido).then(() => {
          const db = Sqlite.getDb()
          db.transaction(tx => {
            const parameters = [
              pedido.tempId || pedido.id,
              pedido.id,
              pedido.idAlphaExpress,
              pedido.numeroPedido,
              pedido.clienteId,
              pedido.dataEHora,
              pedido.subTotal,
              pedido.descontoReal,
              pedido.descontoPercentual,
              pedido.total,
              pedido.anotacoes,
              pedido.sincronizado,
              pedido.subEmpresaId,
              pedido.formaPagamentoId,
              userInfo.id,
              pedido.usuarioAlteracaoId,
              pedido.fechado,
              pedido.latitude,
              pedido.longitude,
              pedido.precisaoLocalizacao,
              pedido.idAparelho,
              pedido.empresaId,
              pedido.dataCriacao,
              pedido.dataAlteracao,
              pedido.revertido === true
            ]
            const sqlPedido = `insert or replace into Pedido values (${parameters.map(() => '?').join(',')})`
            tx.executeSql(
              sqlPedido,
              parameters,
              () => {
                pedido.itens.forEach((subItem, index) => {
                  const parameters = [
                    subItem.tempId || subItem.id,
                    subItem.id,
                    subItem.idAlphaExpress,
                    subItem.tempPedidoId || subItem.pedidoId,
                    subItem.pedidoId,
                    subItem.produtoId,
                    subItem.quantidade,
                    subItem.valorUnitario,
                    subItem.descontoReal,
                    subItem.descontoPercentual,
                    subItem.valorTotal,
                    subItem.empresaId
                  ]

                  const sqlPedidoItem = `insert or replace into PedidoItem values (${parameters.map(() => '?').join(',')})`

                  tx.executeSql(sqlPedidoItem, parameters, () => {
                    if (index === (pedido.itens.length - 1)) {
                      resolve()
                    }
                  })
                })
              })
          }, reject, resolve)
        }).catch(err => reject(err))
      })
    })
  }

  static GetList () {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId']).then(([empresaStr, subEmpresaStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]

        const query = `select * from Pedido where empresaId = '${empresa.id}' and subEmpresaId = '${subEmpresaId}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetListItens () {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId']).then(([empresaStr, subEmpresaStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]

        const query = `select * from PedidoItem where empresaId = '${empresa.id}' and subEmpresaId = '${subEmpresaId}' and pedidoId is null`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetPedidosCriados () {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId']).then(([empresaStr, subEmpresaStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]

        const query = `select * from Pedido where empresaId = '${empresa.id}' and subEmpresaId = '${subEmpresaId}' and idAparelho is not null and fechado = 1`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => {
            const pedidos = [...rows._array]

            if (!pedidos.length) {
              resolve([])
            }

            pedidos.forEach((pedido, index) => {
              pedido.revertido = false
              this.GetItensByIdToSync(pedido.tempId).then(itens => {
                pedido.itens = itens

                if (index === (rows.length - 1)) {
                  resolve(pedidos)
                }
              })
            })
          }, (_, error) => { return reject(error) })
        })
      })
    })
  }

  static FiltroHistoricoCliente (dateEntrada, dateSaida, clienteId, offset = 0) {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId', 'UserInfo']).then(([empresaStr, subEmpresaStr, userStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]
        const userId = JSON.parse(userStr[1])

        let query = `
        SELECT
          c.nomeRazao,
          c.apelido,
          p.id,
          p.clienteId,
          p.tempId,
          p.usuarioCriacaoId,
          p.idAlphaExpress,
          p.dataEhora,
          p.total,
          p.subEmpresaId
        FROM Pedido p
        INNER JOIN Cliente c ON c.id = p.clienteId
        WHERE p.clienteId = '${clienteId}' and p.empresaId = '${empresa.id}' and p.subEmpresaId = '${subEmpresaId} and p.usuarioCriacaoId = '${userId.id}'
         `
        const clauses = []

        if (dateEntrada && dateSaida) {
          clauses.push(`p.dataEhora >= '${dateEntrada}' AND p.dataEhora <= '${dateSaida}'`)
        }

        if (clauses.length) {
          query += ` and ${clauses.join(' and ')}`
        }

        query += ' ORDER BY p.dataEhora DESC'

        query += ' limit 10'
        query += ' offset ?'

        db.transaction(tx => {
          tx.executeSql(query, [offset], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetListHistoricoPedido (clienteId) {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId']).then(([empresaStr, subEmpresaStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]

        const query = `
        SELECT p.tempId
        FROM Pedido p
        INNER JOIN Cliente c ON c.id = p.clienteId
        WHERE p.clienteId = '${clienteId}'
        AND p.empresaId = '${empresa.id}'
        AND p.subEmpresaId = '${subEmpresaId}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetItensById (tempPedidoId) {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId']).then(([empresaStr, subEmpresaStr]) => {
        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]

        const db = Sqlite.getDb()

        const query = `
        select e.quantidade as estoqueAtual, pi.id, pi.tempId, pi.produtoId, p.fotoBase64, p.nome as nome, p.fracionado, pi.quantidade, pi.valorUnitario, pi.descontoReal, pi.descontoPercentual, pi.valorTotal
        from PedidoItem pi
        inner join Produto p on p.id = pi.produtoId
        left outer join Estoque e on p.id = e.produtoId
        where pi.empresaId = '${empresa.id}' and pi.tempPedidoId = '${tempPedidoId}' and e.subEmpresaId = '${subEmpresaId}'`

        // Criando transaction
        db.transaction((tx) => {
          // Executando query de pedidos por tempID
          tx.executeSql(query, [], (_, res) => {
            const itens = res.rows._array.map(item => ({ ...item, subTotal: item.valorTotal + item.descontoReal }))
            resolve(itens)
          }, (_, error) => {
            reject(error)
          })
        }, reject)
      })
    })
  }

  static GetItensByIdToSync (tempPedidoId) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const empresa = JSON.parse(empresaStr)
        const db = Sqlite.getDb()

        const query = `
        select pi.id, pi.tempId, pi.produtoId, pi.quantidade, pi.valorUnitario, pi.descontoReal, pi.descontoPercentual, pi.valorTotal
        from PedidoItem pi where pi.empresaId = '${empresa.id}' and pi.tempPedidoId = '${tempPedidoId}'`

        // Criando transaction
        db.transaction((tx) => {
          // Executando query de pedidos por tempID
          tx.executeSql(query, [], (_, res) => {
            const itens = res.rows._array.map(item => ({ ...item, subTotal: item.valorTotal + item.descontoReal }))
            resolve(itens)
          }, (_, error) => {
            reject(error)
          })
        }, reject)
      })
    })
  }

  static GetItensByIdToPrint (tempPedidoId) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `
        SELECT
          pi.idAlphaExpress,
          pi.quantidade,
          pi.descontoReal,
          pi.valorUnitario,
          pi.valorTotal,
          pr.nome as nomeProduto,
          pr.fracionado,
          un.nome as nomeUnidadeProduto,
          mp.nome as nomeMarcaProduto,
          gp.nome as nomeGrupoProduto
        FROM PedidoItem pi
        LEFT OUTER JOIN Produto pr ON pi.produtoId = pr.id
        LEFT OUTER JOIN UnidadeProduto un ON pr.unidadeId = un.id
        LEFT OUTER JOIN MarcaProduto mp ON pr.marcaId = mp.id
        LEFT OUTER JOIN GrupoProduto gp ON pr.grupoId = gp.id
        WHERE pi.empresaId = '${empresa.id}' and pi.tempPedidoId = '${tempPedidoId}'
        `

        db.transaction((tx) => {
          tx.executeSql(query, [], (_, res) => {
            resolve(res.rows._array)
          }, (_, error) => {
            reject(error)
          })
        }, reject)
      })
    })
  }

  static RemoveItens (pedido) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = pedido.id
          ? `delete from PedidoItem where empresaId = '${empresa.id}' and tempPedidoId = '${pedido.tempId}'`
          : `delete from PedidoItem where empresaId = '${empresa.id}' and pedidoId = '${pedido.id}'`

        // Criando transaction
        db.transaction((tx) => {
          // Executando query de pedidos por tempID
          tx.executeSql(query, [], () => resolve(),
            (_, error) => {
              return reject(error)
            }
          )
        }, reject)
      })
    })
  }

  static FiltroPedidos ({ filtros }, dateEntrada, dateSaida, { allChecks }, offset = 0) {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId', 'UserInfo']).then(([empresaStr, subEmpresaStr, userStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]
        const user = JSON.parse(userStr[1])

        let query = `
          SELECT
            c.nomeRazao,
            c.apelido,
            p.id,
            p.numeroPedido,
            p.tempId,
            p.usuarioCriacaoId,
            p.clienteId,
            p.dataEHora,
            p.idAlphaExpress,
            f.nome as formaPagamento,
            p.formaPagamentoId,
            p.sincronizado,
            p.fechado,
            p.total,
            p.revertido
          FROM Pedido p
          INNER JOIN Cliente c ON c.id = p.clienteId
          INNER JOIN FormaPagamento f ON f.id = p.formaPagamentoId 
        `
        const clauses = [`p.empresaId = '${empresa.id}' and p.subEmpresaId = '${subEmpresaId}' and p.usuarioCriacaoId = '${user.id}'`]
        const clauses2 = []

        if (filtros.cliente) {
          clauses.push(`(c.nomeRazao like '%${filtros.cliente}%' or c.apelido like '%${filtros.cliente}%' or c.cpf like '%${filtros.cliente}%' or c.rg like '%${filtros.cliente}%')`)
        }

        if (dateEntrada && dateSaida) {
          clauses.push(`p.dataEHora >= '${dateEntrada}' AND p.dataEHora <= '${dateSaida}'`)
        }

        if (filtros.status === 'Pendente') {
          clauses.push('p.id is null and p.fechado = 1')
        } else if (filtros.status === 'Sincronizado na Web') {
          clauses.push('p.id is not null and p.idAlphaExpress = 0')
        } else if (filtros.status === 'Sincronizado no Alpha') {
          clauses.push('p.id is not null and p.idAlphaExpress > 0')
        } else if (filtros.status === 'Orcamento') {
          clauses.push('p.fechado = 0')
        }

        if (filtros.formaPagamentoId) {
          clauses.push(`p.formaPagamentoId = '${filtros.formaPagamentoId}'`)
        }

        if (clauses.length) {
          query += ` WHERE ${clauses.join(' and ')}`
        }

        if (allChecks.checke1) {
          if (allChecks.checke1 === 'ASC') {
            clauses2.push(' p.dataEHora ASC')
          } else if (allChecks.checke2 === 'DESC') {
            clauses2.push(' p.dataEHora DESC')
          }
        }

        if (allChecks.checke2) {
          if (allChecks.checke2 === 'ASC') {
            clauses2.push(' c.apelido ASC')
          } else if (allChecks.checke2 === 'DESC') {
            clauses2.push(' c.apelido DESC')
          }
        }

        if (allChecks.checke3) {
          if (allChecks.checke3 === 'ASC') {
            clauses2.push(' c.nomeRazao ASC')
          } else if (allChecks.checke3 === 'DESC') {
            clauses2.push(' c.nomeRazao DESC')
          }
        }

        if (clauses2.length) {
          query += ` ORDER BY ${clauses2.join(', ')}`
        } else {
          query += ' ORDER BY p.dataEHora DESC'
        }

        query += ' limit 10'
        query += ' offset ?'

        db.transaction(tx => {
          tx.executeSql(query, [offset], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static PedidosDashboard ({ filtros }) {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId', 'UserInfo']).then(([empresaStr, subEmpresaStr, userStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]
        const user = JSON.parse(userStr[1])

        let query = (
          `
          SELECT
            p.id,
            p.numeroPedido,
            p.tempId,
            p.usuarioCriacaoId,
            p.clienteId,
            p.dataEHora,
            p.idAlphaExpress,
            f.nome as formaPagamento,
            p.formaPagamentoId,
            p.sincronizado,
            p.fechado,
            p.total
          FROM Pedido p
          INNER JOIN Cliente c ON c.id = p.clienteId
          INNER JOIN FormaPagamento f ON f.id = p.formaPagamentoId 
        `
        )
        const clauses = [`p.empresaId = '${empresa.id}' and p.subEmpresaId = '${subEmpresaId}' and p.usuarioCriacaoId = '${user.id}'`]

        if (clauses.length) {
          query += ` WHERE ${clauses.join(' and ')}`
        }

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => {
            const pedidos = rows._array

            const jan = pedidos.filter(q => q.dataEHora >= filtros.dateInicioJan && q.dataEHora <= filtros.dateFimJan)
            const fev = pedidos.filter(q => q.dataEHora >= filtros.dateInicioFev && q.dataEHora <= filtros.dateFimFev)
            const mar = pedidos.filter(q => q.dataEHora >= filtros.dateInicioMar && q.dataEHora <= filtros.dateFimMar)
            const abr = pedidos.filter(q => q.dataEHora >= filtros.dateInicioAbr && q.dataEHora <= filtros.dateFimAbr)
            const mai = pedidos.filter(q => q.dataEHora >= filtros.dateInicioMai && q.dataEHora <= filtros.dateFimMai)
            const jun = pedidos.filter(q => q.dataEHora >= filtros.dateInicioJun && q.dataEHora <= filtros.dateFimJun)
            const jul = pedidos.filter(q => q.dataEHora >= filtros.dateInicioJul && q.dataEHora <= filtros.dateFimJul)
            const ago = pedidos.filter(q => q.dataEHora >= filtros.dateInicioAgo && q.dataEHora <= filtros.dateFimAgo)
            const set = pedidos.filter(q => q.dataEHora >= filtros.dateInicioSet && q.dataEHora <= filtros.dateFimSet)
            const out = pedidos.filter(q => q.dataEHora >= filtros.dateInicioOut && q.dataEHora <= filtros.dateFimOut)
            const nov = pedidos.filter(q => q.dataEHora >= filtros.dateInicioNov && q.dataEHora <= filtros.dateFimNov)
            const dez = pedidos.filter(q => q.dataEHora >= filtros.dateInicioDez && q.dataEHora <= filtros.dateFimDez)
            const dia = pedidos.filter(q => q.dataEHora >= filtros.dateInicioDia && q.dataEHora <= filtros.dateFimDia)
            const semana = pedidos.filter(q => q.dataEHora >= filtros.dateInicioSem && q.dataEHora <= filtros.dateFimSem)

            const newList = []
            newList.push(jan)
            newList.push(fev)
            newList.push(mar)
            newList.push(abr)
            newList.push(mai)
            newList.push(jun)
            newList.push(jul)
            newList.push(ago)
            newList.push(set)
            newList.push(out)
            newList.push(nov)
            newList.push(dez)

            newList.push(dia)
            newList.push(semana)

            return resolve(newList)
          }, (_, error) => { return reject(error) })
        })
      })
    })
  }

  static Remove (values) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        db.transaction(tx => {
          tx.executeSql(`delete from Pedido where empresaId = '${empresa.id}' and Id in (${values.map(item => `'${item}'`).join(',')})`)
          tx.executeSql(`delete from PedidoItem where empresaId = '${empresa.id}' and PedidoId in (${values.map(item => `'${item}'`).join(',')})`)
        }, reject, resolve)
      })
    })
  }

  static RemoveAll () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        db.transaction(tx => {
          tx.executeSql(`delete from Pedido where empresaId = '${empresa.id}'`)
        }, reject, resolve)
      })
    })
  }

  static Delete () {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        tx.executeSql('delete from Pedido')
      }, reject, resolve)
    })
  }

  static RemoveByTempId (ids) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        db.transaction(tx => {
          tx.executeSql(`delete from Pedido where empresaId = '${empresa.id}' and tempId in (${ids.map(item => `'${item}'`).join(',')})`)
        }, reject, resolve)
      })
    })
  }

  static RemoveByOneTempId (id) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        db.transaction(tx => {
          tx.executeSql(`delete from Pedido where empresaId = '${empresa.id}' and tempId = '${id}'`)
        }, reject, resolve)
      })
    })
  }

  static GetListComparacaoAlteracoes () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select id, dataCriacao, dataAlteracao from Pedido where empresaId = '${empresa.id}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetOne (tempId) {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId']).then(([empresaStr, subEmpresaStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]

        const query = `select * from Pedido where empresaId = '${empresa.id}' and tempId = '${tempId}' and subEmpresaId = '${subEmpresaId}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => {
            const pedido = rows._array[0]
            this.GetItensById(pedido.tempId).then(itens => {
              pedido.itens = itens
              return resolve(pedido)
            })
          }, (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetOnePrint (tempId) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `
        SELECT
          p.clienteId,
          p.formaPagamentoId,
          p.dataEHora,
          p.total,
          p.subTotal,
          p.descontoReal,
          p.idAlphaExpress,
          p.tempId,
          p.anotacoes,
          p.descontoReal,
          p.fechado,
          p.numeroPedido
        FROM Pedido p
        WHERE p.empresaId = '${empresa.id}' and p.tempId = '${tempId}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => {
            const pedido = rows._array[0]
            ClienteDAO.GetClienteWithTempId(pedido.clienteId).then(cliente => {
              pedido.cliente = cliente
              FormaPagamentoDAO.GetById(pedido.formaPagamentoId).then(forma => {
                pedido.formaPagamento = forma
                this.GetItensByIdToPrint(pedido.tempId).then(itens => {
                  pedido.itens = itens
                  CidadeDAO.GetByCodigoIbge(cliente.codigoIbgeCidade).then(cidade => {
                    pedido.cidade = cidade
                    return resolve(pedido)
                  })
                })
              })
            })
          }, (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetListComparacaoRemocao () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select id from Pedido where empresaId = '${empresa.id}' and id is not null`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array.map(item => item.id)), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetCount ({ cliente, dateEntrada, dateSaida, status, formaPagamentoId }) {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId', 'UserInfo']).then(([empresaStr, subEmpresaStr, userStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]
        const user = JSON.parse(userStr[1])
        let query = 'select count(p.tempId) as contagem from Pedido p inner join Cliente c on c.id = p.clienteId'

        const clauses = [`p.empresaId = '${empresa.id}' and p.subEmpresaId = '${subEmpresaId}' and p.usuarioCriacaoId = '${user.id}'`]

        if (cliente) {
          clauses.push(`(c.nomeRazao like '%${cliente}%' or c.apelido like '%${cliente}%' or c.cpf like '%${cliente}%' or c.rg like '%${cliente}%')`)
        }

        if (dateEntrada && dateSaida) {
          clauses.push(`p.dataEHora >= '${dateEntrada}' AND p.dataEHora <= '${dateSaida}'`)
        }

        if (status === 'Pendente') {
          clauses.push('p.id is null and p.fechado = 1')
        } else if (status === 'Sincronizado na Web') {
          clauses.push('p.id is not null and p.idAlphaExpress = 0')
        } else if (status === 'Sincronizado no Alpha') {
          clauses.push('p.id is not null and p.idAlphaExpress > 0')
        } else if (status === 'Orcamento') {
          clauses.push('p.fechado = 0')
        }

        if (formaPagamentoId) {
          clauses.push(`p.formaPagamentoId = '${formaPagamentoId}'`)
        }

        if (clauses.length) {
          query += ` WHERE ${clauses.join(' and ')}`
        }

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array.map(item => item.contagem).reduce((prev, curr) => prev + curr)), (_, error) => { return reject(error) })
        })
      })
    })
  }
}
