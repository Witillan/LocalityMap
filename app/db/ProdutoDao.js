import Sqlite from './Sqlite'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const TipoProduto = {
  Todos: 0,
  Compra: 1,
  Venda: 2
}

export default class ProdutoDAO {
  static AddOrReplaceFromAPI (values) {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        values.forEach(item => {
          const valores = [
            item.id,
            item.idAlphaExpress,
            item.codigoInterno,
            item.codigoFabrica,
            item.nome,
            item.unidadeId,
            item.marcaId,
            item.grupoId,
            item.valorVenda,
            item.fracionado,
            item.inativo,
            item.empresaId,
            item.dataCriacao,
            item.dataAlteracao,
            item.fotoBase64,
            item.tipoProduto,
            item.promocao,
            item.valorPromocao,
            item.inicioPromocao,
            item.finalPromocao,
            item.aviso,
            item.valorCompra
          ]

          tx.executeSql(`insert or replace into Produto values (${valores.map(() => ' ? ').join(',')})`, valores)
        })
      }, reject, resolve)
    })
  }

  static GetList () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select * from Produto where empresaId = '${empresa.id}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetListComplete (filtros = {}, offset = null) {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId', 'UserInfo']).then(([empresaStr, subEmpresaStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])

        let query = `
        select
          p.id,
          p.idAlphaExpress,
          p.codigoInterno,
          p.nome,
          p.valorVenda,
          p.fracionado,
          p.fotoBase64,
          p.tipoProduto,
          p.promocao,
          p.inicioPromocao,
          p.finalPromocao,
          p.valorPromocao,
          e.quantidade as estoqueAtual,
          m.nome as marca,
          p.aviso,
          p.valorCompra
        from Produto p
        inner join Estoque e on p.id = e.produtoId
        left outer join MarcaProduto m on p.marcaId = m.id
        `

        const clauses = [`p.empresaId = '${empresa.id}'`, `e.subEmpresaId = '${subEmpresaStr[1]}'`]

        if (filtros.qrcode) {
          clauses.push(`p.codigoInterno = '${filtros.qrcode}'`)
        } else if (filtros.nome) {
          clauses.push(`(p.codigoInterno = '${filtros.nome}' or p.nome like '%${filtros.nome}%')`)
        }

        if (filtros.tipoProduto !== undefined) {
          clauses.push(`(p.tipoProduto = '${filtros.tipoProduto}' or p.tipoProduto is null or p.tipoProduto = '')`)
        }

        if (clauses.length) {
          query += ` where ${clauses.join(' and ')}`
        }

        query += ' order by p.nome ASC'

        query += ' limit 20'

        if (offset) {
          query += ` offset ${offset}`
        }

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => {
            if (!filtros.tabelaPrecoId) {
              resolve(rows._array)
              return
            }
            const produtos = rows._array
            const tabelaPrecoQuery = `select produtoId, valor from TabelaPrecoProduto where produtoId in (${produtos.map(item => `'${item.id}'`)}) and tabelaPrecoId = '${filtros.tabelaPrecoId}'`

            tx.executeSql(tabelaPrecoQuery, [], (_, { rows }) => {
              const tabelasPreco = rows._array

              tabelasPreco.forEach(item => {
                const index = produtos.findIndex(q => q.id === item.produtoId)

                if (index > -1) {
                  produtos[index].valorVendaTabelado = item.valor
                }
              })

              resolve(produtos)
            })
          }, (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetCount (filtros = {}) {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId'])
        .then(([empresaStr, subEmpresaStr]) => {
          const db = Sqlite.getDb()

          const empresa = JSON.parse(empresaStr[1])

          let query = 'select count(p.id) as contagem from Produto p inner join Estoque e on p.id = e.produtoId'

          const clauses = [`p.empresaId = '${empresa.id}'`, `e.subEmpresaId = '${subEmpresaStr[1]}'`]

          if (filtros.nome) {
            clauses.push(`(p.codigoInterno = '${filtros.nome}' or p.nome like '%${filtros.nome}%')`)
          }

          if (clauses.length) {
            query += ` where ${clauses.join(' and ')}`
          }

          db.transaction(tx => {
            tx.executeSql(query, [], (_, { rows }) => resolve(rows._array.map(item => item.contagem).reduce((prev, curr) => prev + curr)), (_, error) => { return reject(error) })
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
          tx.executeSql(`delete from Produto where empresaId = '${empresa.id}' and Id in (${values.map(item => `'${item}'`).join(',')})`)
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
          tx.executeSql(`delete from Produto where empresaId = '${empresa.id}'`)
        }, reject, resolve)
      })
    })
  }

  static Delete () {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        tx.executeSql('delete from Produto')
      }, reject, resolve)
    })
  }

  static GetListComparacaoAlteracoes () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select id, dataCriacao, dataAlteracao from Produto where empresaId = '${empresa}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetListComparacaoRemocao () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select id from Produto where empresaId = '${empresa.id}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array.map(item => item.id)), (_, error) => { return reject(error) })
        })
      })
    })
  }
}
