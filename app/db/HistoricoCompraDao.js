import AsyncStorage from '@react-native-async-storage/async-storage'

import Sqlite from './Sqlite'

export default class HistoricoCompraDAO {
  static AddOrReplaceFromAPI (values) {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        values.forEach(item => {
          const parameters = [
            item.id,
            item.idAlphaExpress,
            item.fornecedorId,
            item.dataEHora,
            item.subTotal,
            item.descontoReal,
            item.acrescimo,
            item.total,
            item.anotacoes,
            item.sincronizado,
            item.subEmpresaId,
            item.formaPagamentoId,
            item.empresaId,
            item.dataCriacao,
            item.dataAlteracao
          ]
          const sqlHistoricoCompra = `insert or replace into HistoricoCompra values (${parameters.map(() => '?').join(',')})`
          tx.executeSql(
            sqlHistoricoCompra,
            parameters,
            () => {
              item.itens.forEach(subItem => {
                const parameters = [
                  subItem.id,
                  subItem.idAlphaExpress,
                  subItem.compraId,
                  subItem.produtoId,
                  subItem.quantidade,
                  subItem.valorUnitario,
                  subItem.descontoReal,
                  subItem.acrescimo,
                  subItem.valorTotal,
                  subItem.empresaId
                ]

                const sqlHistoricoCompraItem = `insert or replace into HistoricoCompraItem values (${parameters.map(() => '?').join(',')})`

                tx.executeSql(sqlHistoricoCompraItem, parameters)
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

        const query = `select * from HistoricoCompra where empresaId = '${empresa.id}'`

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

        const query = `select * from HistoricoCompraItem where empresaId = '${empresa.id}' and compraId is null`

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

        const query = `select count(id) as contagem from HistoricoCompra where empresaId = '${empresa.id}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array.map(item => item.contagem).reduce((prev, curr) => prev + curr)), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetHistoricoComprasCriados () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select * from HistoricoCompra where empresaId = '${empresa.id}' id is null and idAlphaExpress = 0`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => {
            const compras = [...rows._array]

            if (!compras.length) {
              resolve([])
            }

            compras.forEach((compra, index) => {
              this.GetItensById(compra.tempId).then(itens => {
                compra.itens = itens

                if (index === (rows.length - 1)) {
                  resolve(compras)
                }
              })
            })
          }, (_, error) => { return reject(error) })
        })
      })
    })
  }

  static FiltroHistoricoFornecedor (dateEntrada, dateSaida, fornecedorId, offset = 0) {
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
          p.fornecedorId,
          p.idAlphaExpress,
          p.dataEhora,
          p.total,
          p.subTotal,
          p.subEmpresaId
        FROM HistoricoCompra p
        INNER JOIN Fornecedor c ON c.id = p.fornecedorId
        WHERE p.fornecedorId = '${fornecedorId}'
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
            const compras = rows._array

            if (!compras.length) {
              resolve([])
            }

            compras.forEach((compra, index) => {
              this.GetItensById(compra.id).then(itens => {
                compra.itens = itens

                if ((compras.length - 1) === index) {
                  resolve(compras)
                }
              })
            })
          }, (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetListHistoricoHistoricoCompra (fornecedorId) {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId']).then(([empresaStr, subEmpresaStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]

        const query = `
        SELECT p.tempId
        FROM HistoricoCompra p
        INNER JOIN Fornecedor c ON c.id = p.fornecedorId
        WHERE p.fornecedorId = '${fornecedorId}'
        AND p.empresaId = '${empresa.id}'
        AND p.subEmpresaId = '${subEmpresaId}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetItensById (tempHistoricoCompraId) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `
        select pi.id, pi.produtoId, p.nome as nome, pi.quantidade, pi.valorUnitario, pi.descontoReal, pi.acrescimo, pi.valorTotal
        from HistoricoCompraItem pi
        inner join Produto p on p.id = pi.produtoId
        where pi.empresaId = '${empresa.id}' and pi.compraId = '${tempHistoricoCompraId}'`

        // Criando transaction
        db.transaction((tx) => {
          // Executando query de compras por tempID
          tx.executeSql(query, [], (_, res) => {
            resolve(res.rows._array)
          }, (_, error) => {
            reject(error)
          })
        }, reject)
      })
    })
  }

  static GetItensByIdToPrint (tempHistoricoCompraId) {
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
        FROM HistoricoCompraItem pi
        LEFT OUTER JOIN Produto pr ON pi.produtoId = pr.id
        LEFT OUTER JOIN UnidadeProduto un ON pr.unidadeId = un.id
        LEFT OUTER JOIN MarcaProduto mp ON pr.marcaId = mp.id
        LEFT OUTER JOIN GrupoProduto gp ON pr.grupoId = gp.id
        LEFT OUTER JOIN Estoque es ON pr.id = es.produtoId
        WHERE pi.empresaId = '${empresa.id}' and pi.tempHistoricoCompraId = '${tempHistoricoCompraId}'
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

  static RemoveItensByTempId (tempHistoricoCompraId) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `delete from HistoricoCompraItem where empresaId = '${empresa.id}' and tempHistoricoCompraId = '${tempHistoricoCompraId}'`

        // Criando transaction
        db.transaction((tx) => {
          // Executando query de compras por tempID
          tx.executeSql(query, [], () => resolve(),
            (_, error) => {
              return reject(error)
            }
          )
        }, reject)
      })
    })
  }

  static FiltroHistoricoCompras ({ filtros }, { allChecks }, offset = 0) {
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
            p.fornecedorId,
            p.dataEHora,
            p.idAlphaExpress,
            f.nome as formaPagamento,
            p.formaPagamentoId,
            p.sincronizado,
            p.total
          FROM HistoricoCompra p
          INNER JOIN Fornecedor c ON c.id = p.fornecedorId
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
          tx.executeSql(`delete from HistoricoCompra where empresaId = '${empresa.id}' and Id in (${values.map(item => `'${item}'`).join(',')})`)
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
          tx.executeSql(`delete from HistoricoCompra where empresaId = '${empresa.id}'`, [], () => {
            tx.executeSql(`delete from HistoricoCompraItem where empresaId = '${empresa.id}'`, [], () => {
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
          tx.executeSql(`delete from HistoricoCompra where empresaId = '${empresa}' and id in (${ids.map(item => `'${item}'`).join(',')})`)
        }, reject, resolve)
      })
    })
  }

  static GetListComparacaoAlteracoes () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select id, dataCriacao, dataAlteracao from HistoricoCompra where empresaId = '${empresa.id}'`

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

        const query = `select * from HistoricoCompra where empresaId = '${empresa.id}' and id = '${id}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => {
            const compra = rows._array[0]
            this.GetItensById(compra.tempId).then(itens => {
              compra.itens = itens
              return resolve(compra)
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

        const query = `select id from HistoricoCompra where empresaId = '${empresa.id}' and id is not null`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array.map(item => item.id)), (_, error) => { return reject(error) })
        })
      })
    })
  }
}
