import AsyncStorage from '@react-native-async-storage/async-storage'

import Sqlite from './Sqlite'

export default class HistoricoPedidoDAO {
  static AddOrReplaceFromAPI (values) {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        values.forEach(item => {
          const parameters = [
            item.id,
            item.idAlphaExpress,
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
            item.empresaId,
            item.dataCriacao,
            item.dataAlteracao
          ]
          const sqlHistoricoPedido = `insert or replace into HistoricoPedido values (${parameters.map(() => '?').join(',')})`
          tx.executeSql(
            sqlHistoricoPedido,
            parameters,
            () => {
              item.itens.forEach(subItem => {
                const parameters = [
                  subItem.id,
                  subItem.idAlphaExpress,
                  subItem.pedidoId,
                  subItem.produtoId,
                  subItem.quantidade,
                  subItem.valorUnitario,
                  subItem.descontoReal,
                  subItem.descontoPercentual,
                  subItem.valorTotal,
                  subItem.empresaId
                ]

                const sqlHistoricoPedidoItem = `insert or replace into HistoricoPedidoItem values (${parameters.map(() => '?').join(',')})`

                tx.executeSql(sqlHistoricoPedidoItem, parameters)
              })
            })
        })
      }, reject, resolve)
    })
  }

  static GetList () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select * from HistoricoPedido where empresaId = '${empresa.id}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetListItens () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select * from HistoricoPedidoItem where empresaId = '${empresa.id}' and pedidoId is null`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetCount () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select count(id) as contagem from HistoricoPedido where empresaId = '${empresa.id}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array.map(item => item.contagem).reduce((prev, curr) => prev + curr)), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetHistoricoPedidosCriados () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select * from HistoricoPedido where empresaId = '${empresa.id}' id is null and idAlphaExpress = 0`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => {
            const pedidos = [...rows._array]

            if (!pedidos.length) {
              resolve([])
            }

            pedidos.forEach((pedido, index) => {
              this.GetItensById(pedido.tempId).then(itens => {
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
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId']).then(([empresaStr, subEmpresaStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]

        let query = `
        SELECT
          c.nomeRazao,
          c.apelido,
          p.id,
          p.clienteId,
          p.idAlphaExpress,
          p.dataEhora,
          p.total,
          p.subTotal,
          p.subEmpresaId
        FROM HistoricoPedido p
        INNER JOIN Cliente c ON c.id = p.clienteId
        WHERE p.clienteId = '${clienteId}'
         `
        const clauses = [`p.empresaId = '${empresa.id}' and p.subEmpresaId = '${subEmpresaId}'`]

        if (dateEntrada && dateSaida) {
          clauses.push(`p.dataEhora >= '${dateEntrada}' AND p.dataEhora <= '${dateSaida}'`)
        }

        if (clauses.length) {
          query += `and ${clauses.join(' and ')}`
        }

        query += ' ORDER BY p.dataEhora DESC'

        query += ' limit 10'
        query += ' offset ?'

        db.transaction(tx => {
          tx.executeSql(query, [offset], (_, { rows }) => {
            const pedidos = rows._array

            if (!pedidos.length) {
              resolve([])
            }

            pedidos.forEach((pedido, index) => {
              this.GetItensById(pedido.id).then(itens => {
                pedido.itens = itens

                if ((pedidos.length - 1) === index) {
                  resolve(pedidos)
                }
              })
            })
          }, (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetListHistoricoHistoricoPedido (clienteId) {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId']).then(([empresaStr, subEmpresaStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]

        const query = `
        SELECT p.tempId
        FROM HistoricoPedido p
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

  static GetItensById (tempHistoricoPedidoId) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `
        select pi.id, pi.produtoId, p.nome as nome, pi.quantidade, pi.valorUnitario, pi.descontoReal, pi.descontoPercentual, pi.valorTotal
        from HistoricoPedidoItem pi
        inner join Produto p on p.id = pi.produtoId
        where pi.empresaId = '${empresa.id}' and pi.pedidoId = '${tempHistoricoPedidoId}'`

        // Criando transaction
        db.transaction((tx) => {
          // Executando query de pedidos por tempID
          tx.executeSql(query, [], (_, res) => {
            resolve(res.rows._array)
          }, (_, error) => {
            reject(error)
          })
        }, reject)
      })
    })
  }

  static GetItensByIdToPrint (tempHistoricoPedidoId) {
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
          pr.nome as nomeProduto,
          un.nome as nomeUnidadeProduto,
          mp.nome as nomeMarcaProduto,
          gp.nome as nomeGrupoProduto
        FROM HistoricoPedidoItem pi
        LEFT OUTER JOIN Produto pr ON pi.produtoId = pr.id
        LEFT OUTER JOIN UnidadeProduto un ON pr.unidadeId = un.id
        LEFT OUTER JOIN MarcaProduto mp ON pr.marcaId = mp.id
        LEFT OUTER JOIN GrupoProduto gp ON pr.grupoId = gp.id
        LEFT OUTER JOIN Estoque es ON pr.id = es.produtoId
        WHERE pi.empresaId = '${empresa.id}' and pi.tempHistoricoPedidoId = '${tempHistoricoPedidoId}'
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

  static RemoveItensByTempId (tempHistoricoPedidoId) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `delete from HistoricoPedidoItem where empresaId = '${empresa.id}' and tempHistoricoPedidoId = '${tempHistoricoPedidoId}'`

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

  static FiltroHistoricoPedidos ({ filtros }, { allChecks }, offset = 0) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        let query = (
          `
          SELECT
            c.nomeRazao,
            c.apelido,
            p.id,
            p.clienteId,
            p.dataEHora,
            p.idAlphaExpress,
            f.nome as formaPagamento,
            p.formaPagamentoId,
            p.sincronizado,
            p.total
          FROM HistoricoPedido p
          INNER JOIN Cliente c ON c.id = p.clienteId
          INNER JOIN FormaPagamento f ON f.id = p.formaPagamentoId
        `
        )

        const clauses = [`p.empresaId = '${empresa.id}'`]
        const clauses2 = []

        if (filtros.nomeRazao) {
          clauses.push(`c.nomeRazao like '%${filtros.nomeRazao}%'`)
        }

        if (filtros.apelido) {
          clauses.push(`c.apelido like '%${filtros.apelido}%'`)
        }

        if (filtros.status === 'Pendente') {
          clauses.push('p.id is null')
        } else if (filtros.status === 'Sincronizado na Web') {
          clauses.push('p.id is not null and p.idAlphaExpress = 0')
        } else if (filtros.status === 'Sincronizado no Alpha') {
          clauses.push('p.id is not null and p.idAlphaExpress > 0')
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
        }

        query += ' limit 10'
        query += ' offset ?'

        db.transaction(tx => {
          tx.executeSql(query, [offset], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
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
          tx.executeSql(`delete from HistoricoPedido where empresaId = '${empresa.id}' and Id in (${values.map(item => `'${item}'`).join(',')})`)
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
          tx.executeSql(`delete from HistoricoPedido where empresaId = '${empresa.id}'`, [], () => {
            tx.executeSql(`delete from HistoricoPedidoItem where empresaId = '${empresa.id}'`, [], () => {
              resolve()
            })
          })
        }, reject, resolve)
      })
    })
  }

  static RemoveById (ids) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        db.transaction(tx => {
          tx.executeSql(`delete from HistoricoPedido where empresaId = '${empresa}' and id in (${ids.map(item => `'${item}'`).join(',')})`)
        }, reject, resolve)
      })
    })
  }

  static GetListComparacaoAlteracoes () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select id, dataCriacao, dataAlteracao from HistoricoPedido where empresaId = '${empresa.id}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetOne (id) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select * from HistoricoPedido where empresaId = '${empresa.id}' and id = '${id}'`

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

  static GetListComparacaoRemocao () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select id from HistoricoPedido where empresaId = '${empresa.id}' and id is not null`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array.map(item => item.id)), (_, error) => { return reject(error) })
        })
      })
    })
  }
}
