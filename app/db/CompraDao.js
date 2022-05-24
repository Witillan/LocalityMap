import AsyncStorage from '@react-native-async-storage/async-storage'
import CidadeDAO from './CidadeDao'
import FornecedorDAO from './FornecedorDao'
import FormaPagamentoDAO from './FormaPagamentoDao'
import Sqlite from './Sqlite'

export default class CompraDAO {
  static AddOrReplaceFromAPI (values) {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        values.forEach(item => {
          const parameters = [
            item.tempId || item.id,
            item.id,
            item.idAlphaExpress,
            item.numeroCompra,
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
            item.usuarioCriacaoId,
            item.usuarioAlteracaoId,
            1,
            item.latitude,
            item.longitude,
            item.precisaoLocalizacao,
            item.idAparelho,
            item.empresaId,
            item.dataCriacao,
            item.dataAlteracao
          ]
          const sqlCompra = `insert or replace into Compra values (${parameters.map(() => '?').join(',')})`
          tx.executeSql(
            sqlCompra,
            parameters,
            () => {
              item.itens.forEach(subItem => {
                const parameters = [
                  subItem.tempId || subItem.id,
                  subItem.id,
                  subItem.idAlphaExpress,
                  subItem.tempCompraId || subItem.compraId,
                  subItem.compraId,
                  subItem.produtoId,
                  subItem.quantidade,
                  subItem.valorUnitario,
                  subItem.descontoReal,
                  subItem.acrescimo,
                  subItem.valorTotal,
                  subItem.empresaId
                ]

                const sqlCompraItem = `insert or replace into CompraItem values (${parameters.map(() => '?').join(',')})`

                tx.executeSql(sqlCompraItem, parameters)
              })
            })
        })
      }, reject, resolve)
    })
  }

  static Save (compra) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('UserInfo').then(userInfoStr => {
        const userInfo = JSON.parse(userInfoStr)

        this.RemoveItensByTempId(compra.tempId).then(() => {
          const db = Sqlite.getDb()
          db.transaction(tx => {
            const parameters = [
              compra.tempId || compra.id,
              compra.id,
              compra.idAlphaExpress,
              compra.numeroCompra,
              compra.fornecedorId,
              compra.dataEHora,
              compra.subTotal,
              compra.descontoReal,
              compra.acrescimo,
              compra.total,
              compra.anotacoes,
              compra.sincronizado,
              compra.subEmpresaId,
              compra.formaPagamentoId,
              userInfo.id,
              compra.usuarioAlteracaoId,
              compra.fechado,
              compra.latitude,
              compra.longitude,
              compra.precisaoLocalizacao,
              compra.idAparelho,
              compra.empresaId,
              compra.dataCriacao,
              compra.dataAlteracao
            ]
            const sqlCompra = `insert or replace into Compra values (${parameters.map(() => '?').join(',')})`
            tx.executeSql(
              sqlCompra,
              parameters,
              () => {
                compra.itens.forEach((subItem, index) => {
                  const parameters = [
                    subItem.tempId || subItem.id,
                    subItem.id,
                    subItem.idAlphaExpress,
                    subItem.tempCompraId || subItem.compraId,
                    subItem.compraId,
                    subItem.produtoId,
                    subItem.quantidade,
                    subItem.valorUnitario,
                    subItem.descontoReal,
                    subItem.acrescimo,
                    subItem.valorTotal,
                    subItem.empresaId
                  ]

                  const sqlCompraItem = `insert or replace into CompraItem values (${parameters.map(() => '?').join(',')})`

                  tx.executeSql(sqlCompraItem, parameters, () => {
                    if (index === (compra.itens.length - 1)) {
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

        const query = `select * from Compra where empresaId = '${empresa.id}' and subEmpresaId = '${subEmpresaId}'`

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

        const query = `select * from CompraItem where empresaId = '${empresa.id}' and subEmpresaId = '${subEmpresaId}' and compraId is null`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetCount () {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId', 'UserInfo']).then(([empresaStr, subEmpresaStr, userStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]
        const userId = JSON.parse(userStr[1])

        const query = `select count(p.tempId) as contagem
        from Compra p
        inner join Fornecedor c on c.id = p.fornecedorId
        where p.empresaId = '${empresa.id}' and p.subEmpresaId = '${subEmpresaId}' and p.usuarioCriacaoId = '${userId.id}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array.map(item => item.contagem).reduce((prev, curr) => prev + curr)), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetComprasCriados () {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId']).then(([empresaStr, subEmpresaStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]

        const query = `select * from Compra where empresaId = '${empresa.id}' and subEmpresaId = '${subEmpresaId}' and idAparelho is not null and fechado = 1`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => {
            const compras = [...rows._array]

            if (!compras.length) {
              resolve([])
            }

            compras.forEach((compra, index) => {
              this.GetItensByIdToSync(compra.tempId).then(itens => {
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
          p.fornecedorId,
          p.tempId,
          p.usuarioCriacaoId,
          p.idAlphaExpress,
          p.dataEhora,
          p.total,
          p.subEmpresaId
        FROM Compra p
        INNER JOIN Fornecedor c ON c.id = p.fornecedorId
        WHERE p.fornecedorId = '${fornecedorId}' and p.empresaId = '${empresa.id}' and p.subEmpresaId = '${subEmpresaId} and p.usuarioCriacaoId = '${userId.id}'
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

  static GetListHistoricoCompra (fornecedorId) {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId']).then(([empresaStr, subEmpresaStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]

        const query = `
        SELECT p.tempId
        FROM Compra p
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

  static GetItensById (tempCompraId) {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId']).then(([empresaStr, subEmpresaStr]) => {
        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]

        const db = Sqlite.getDb()

        const query = `
        select e.quantidade as estoqueAtual, pi.id, pi.tempId, pi.produtoId, p.fotoBase64, p.nome as nome, p.fracionado, pi.quantidade, pi.valorUnitario, pi.descontoReal, pi.acrescimo, pi.valorTotal
        from CompraItem pi
        inner join Produto p on p.id = pi.produtoId
        left outer join Estoque e on p.id = e.produtoId
        where pi.empresaId = '${empresa.id}' and pi.tempCompraId = '${tempCompraId}' and e.subEmpresaId = '${subEmpresaId}'`

        // Criando transaction
        db.transaction((tx) => {
          // Executando query de compras por tempID
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

  static GetItensByIdToSync (tempCompraId) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const empresa = JSON.parse(empresaStr)
        const db = Sqlite.getDb()

        const query = `
        select pi.id, pi.tempId, pi.produtoId, pi.quantidade, pi.valorUnitario, pi.descontoReal, pi.acrescimo, pi.valorTotal
        from CompraItem pi where pi.empresaId = '${empresa.id}' and pi.tempCompraId = '${tempCompraId}'`

        // Criando transaction
        db.transaction((tx) => {
          // Executando query de compras por tempID
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

  static GetItensByIdToPrint (tempCompraId) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `
        SELECT
          pi.idAlphaExpress,
          pi.quantidade,
          pi.acrescimo,
          pi.descontoReal,
          pi.valorUnitario,
          pi.valorTotal,
          pr.nome as nomeProduto,
          pr.fracionado,
          un.nome as nomeUnidadeProduto,
          mp.nome as nomeMarcaProduto,
          gp.nome as nomeGrupoProduto
        FROM CompraItem pi
        LEFT OUTER JOIN Produto pr ON pi.produtoId = pr.id
        LEFT OUTER JOIN UnidadeProduto un ON pr.unidadeId = un.id
        LEFT OUTER JOIN MarcaProduto mp ON pr.marcaId = mp.id
        LEFT OUTER JOIN GrupoProduto gp ON pr.grupoId = gp.id
        WHERE pi.empresaId = '${empresa.id}' and pi.tempCompraId = '${tempCompraId}'
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

  static RemoveItensByTempId (tempCompraId) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `delete from CompraItem where empresaId = '${empresa.id}' and tempCompraId = '${tempCompraId}'`

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

  static FiltroCompras ({ filtros }, dateEntrada, dateSaida, { allChecks }, offset = 0) {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId', 'UserInfo']).then(([empresaStr, subEmpresaStr, userStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]
        const user = JSON.parse(userStr[1])

        let query = (
          `
          SELECT
            c.nomeRazao,
            c.apelido,
            p.id,
            p.numeroCompra,
            p.tempId,
            p.usuarioCriacaoId,
            p.fornecedorId,
            p.dataEHora,
            p.idAlphaExpress,
            f.nome as formaPagamento,
            p.formaPagamentoId,
            p.sincronizado,
            p.fechado,
            p.total
          FROM Compra p
          INNER JOIN Fornecedor c ON c.id = p.fornecedorId
          INNER JOIN FormaPagamento f ON f.id = p.formaPagamentoId 
        `
        )
        const clauses = [`p.empresaId = '${empresa.id}' and p.subEmpresaId = '${subEmpresaId}' and p.usuarioCriacaoId = '${user.id}'`]
        const clauses2 = []

        if (filtros.nomeRazao) {
          clauses.push(`c.nomeRazao like '%${filtros.nomeRazao}%'`)
        }

        if (filtros.apelido) {
          clauses.push(`c.apelido like '%${filtros.apelido}%'`)
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

  static Remove (values) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        db.transaction(tx => {
          tx.executeSql(`delete from Compra where empresaId = '${empresa.id}' and Id in (${values.map(item => `'${item}'`).join(',')})`)
          tx.executeSql(`delete from CompraItem where empresaId = '${empresa.id}' and CompraId in (${values.map(item => `'${item}'`).join(',')})`)
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
          tx.executeSql(`delete from Compra where empresaId = '${empresa.id}'`)
        }, reject, resolve)
      })
    })
  }

  static Delete () {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        tx.executeSql('delete from Compra')
      }, reject, resolve)
    })
  }

  static RemoveByTempId (ids) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        db.transaction(tx => {
          tx.executeSql(`delete from Compra where empresaId = '${empresa.id}' and tempId in (${ids.map(item => `'${item}'`).join(',')})`)
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
          tx.executeSql(`delete from Compra where empresaId = '${empresa.id}' and tempId = '${id}'`)
        }, reject, resolve)
      })
    })
  }

  static GetListComparacaoAlteracoes () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select id, dataCriacao, dataAlteracao from Compra where empresaId = '${empresa.id}'`

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

        const query = `select * from Compra where empresaId = '${empresa.id}' and tempId = '${tempId}' and subEmpresaId = '${subEmpresaId}'`

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

  static GetOnePrint (tempId) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `
        SELECT
          p.fornecedorId,
          p.formaPagamentoId,
          p.dataEHora,
          p.total,
          p.subTotal,
          p.descontoReal,
          p.idAlphaExpress,
          p.tempId,
          p.anotacoes,
          p.descontoReal,
          p.acrescimo,
          p.fechado,
          p.numeroCompra
        FROM Compra p
        WHERE p.empresaId = '${empresa.id}' and p.tempId = '${tempId}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => {
            const compra = rows._array[0]
            FornecedorDAO.GetFornecedorWithTempId(compra.fornecedorId).then(fornecedor => {
              compra.fornecedor = fornecedor
              FormaPagamentoDAO.GetById(compra.formaPagamentoId).then(forma => {
                compra.formaPagamento = forma
                this.GetItensByIdToPrint(compra.tempId).then(itens => {
                  compra.itens = itens
                  CidadeDAO.GetByCodigoIbge(fornecedor.codigoIbgeCidade).then(cidade => {
                    compra.cidade = cidade
                    return resolve(compra)
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

        const query = `select id from Compra where empresaId = '${empresa.id}' and id is not null`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array.map(item => item.id)), (_, error) => { return reject(error) })
        })
      })
    })
  }
}
