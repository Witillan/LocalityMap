import AsyncStorage from '@react-native-async-storage/async-storage'

import Sqlite from './Sqlite'

export const TipoPessoa = {
  PessoaFisica: 1,
  PessoaJuridica: 2
}
export default class ClienteDAO {
  static AddOrReplaceFromAPI (values) {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        values.forEach(item => {
          const parameters = [
            item.tempId || item.id,
            item.id,
            item.idAlphaExpress,
            item.nomeRazao ? item.nomeRazao.trim() : '',
            item.apelido ? item.apelido.trim() : '',
            item.tipoPessoa,
            item.cpf,
            item.rg,
            item.codigoIbgeCidade,
            item.endereco,
            item.numero,
            item.bairro,
            item.cep,
            item.complemento,
            item.telefone,
            item.celular,
            item.contato,
            item.observacao,
            item.idAparelho,
            item.inativo,
            item.bloqueado,
            item.sincronizado,
            item.empresaId,
            item.vendedores,
            item.dataCriacao,
            item.dataAlteracao,
            item.aviso
          ]
          tx.executeSql(`insert or replace into Cliente values (${parameters.map(() => '?').join(',')})`, parameters)
        })
      }, reject, resolve)
    })
  }

  static Insert (value) {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        const parameters = [
          value.tempId || value.id,
          value.id,
          value.idAlphaExpress,
          value.nomeRazao,
          value.apelido,
          value.tipoPessoa,
          value.cpf,
          value.rg,
          value.codigoIbgeCidade,
          value.endereco,
          value.numero,
          value.bairro,
          value.cep,
          value.complemento,
          value.telefone,
          value.celular,
          value.contato,
          value.observacao,
          value.idAparelho,
          value.inativo,
          value.bloqueado,
          value.sincronizado,
          value.empresaId,
          value.vendedores,
          value.dataCriacao,
          value.dataAlteracao,
          value.aviso
        ]
        tx.executeSql(`insert or replace into Cliente values (${parameters.map(() => '?').join(',')})`, parameters)
      }, reject, resolve)
    })
  }

  static GetListAll () {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'UserInfo', 'Configuracoes']).then(([empresaStr, userInfoStr, configStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const user = JSON.parse(userInfoStr[1])
        const config = JSON.parse(configStr[1])
        const isByRegion = config[0].clientePorRegiao

        let query = 'select * from Cliente'

        const clauses = [`empresaId = '${empresa.id}'`]

        if (isByRegion) {
          clauses.push(`(vendedores like '%${user.idAlphaExpress}%' or vendedores is not null or vendedores <> '')`)
        }

        if (clauses.length) {
          query += ` where ${clauses.join(' and ')}`
        }

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => {
            const clientes = rows._array

            return resolve(clientes)
          }, (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetClienteWithTempId (tempId) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select * from Cliente where empresaId = '${empresa.id}' and tempId = '${tempId}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array.length ? rows._array[0] : null), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static Filter (busca, offset = 0) {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'UserInfo', 'Configuracoes']).then(([empresaStr, userInfoStr, configStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const user = JSON.parse(userInfoStr[1])
        const config = JSON.parse(configStr[1])
        const isByRegion = config[0].clientePorRegiao

        let query = `
        select
          c.id,
          c.nomeRazao,
          c.apelido,
          c.vendedores,
          c.idAlphaExpress,
          c.cpf,
          c.endereco,
          c.numero,
          c.codigoIbgeCidade,
          ci.codigoIbge,
          ci.nome as nomeCidade,
          ci.uf,
          c.aviso
        from Cliente c
        inner join Cidade ci on ci.codigoIbge = c.codigoIbgeCidade`

        const clauses = [`c.empresaId = '${empresa.id}' and c.id is not null and (c.nomeRazao like '%${busca}%' or c.apelido like '%${busca}%' or c.idAlphaExpress like '%${busca}%' or c.cpf like '%${busca}%')`]

        if (isByRegion) {
          clauses.push(`(vendedores like '%,${user.idAlphaExpress},%' or vendedores = '${user.idAlphaExpress}' or vendedores like '%,${user.idAlphaExpress}' or vendedores like '${user.idAlphaExpress},%' or vendedores is null or vendedores = '')`)
        }

        if (clauses.length) {
          query += ` where ${clauses.join(' and ')}`
        }

        query += ' order by c.nomeRazao'

        query += ' limit 20'
        query += ' offset ?'

        db.transaction(tx => {
          tx.executeSql(query, [offset], (_, { rows }) => {
            const clientes = rows._array

            return resolve(clientes)
          }, (_, error) => { return reject(error) })
        })
      })
    })
  }

  static FilterCliente (nomeCliente, cpf, offset = 0) {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'UserInfo', 'Configuracoes']).then(([empresaStr, userInfoStr, configStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const user = JSON.parse(userInfoStr[1])
        const config = JSON.parse(configStr[1])
        const isByRegion = config[0].clientePorRegiao

        let query = `
        SELECT
          c.apelido,
          c.nomeRazao,
          c.vendedores,
          c.cpf,
          c.celular,
          c.telefone,
          c.numero,
          c.endereco,
          c.bloqueado,
          c.inativo,
          c.id,
          c.tempId,
          c.codigoIbgeCidade,
          ci.codigoIbge,
          ci.nome as nomeCidade,
          ci.uf,
          c.aviso
        FROM Cliente c
        LEFT OUTER JOIN Cidade ci ON ci.codigoIbge = c.codigoIbgeCidade 
        `
        const clauses = [`c.empresaId = '${empresa.id}'`]

        if (isByRegion) {
          clauses.push(`(c.vendedores like '%,${user.idAlphaExpress},%' or c.vendedores = '${user.idAlphaExpress}' or c.vendedores like '%,${user.idAlphaExpress}' or c.vendedores like '${user.idAlphaExpress},%' or c.vendedores is null or c.vendedores = '')`)
        }

        if (nomeCliente) {
          clauses.push(`(c.apelido like '%${nomeCliente}%' or c.nomeRazao like '%${nomeCliente}%')`)
        }

        if (cpf) {
          clauses.push(`c.cpf like '%${cpf}%'`)
        }

        if (clauses.length) {
          query += ` where ${clauses.join(' and ')}`
        }

        query += ' order by c.nomeRazao ASC, c.apelido ASC'

        query += ' limit 20'
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
          tx.executeSql(`delete from Cliente where empresaId = '${empresa.id}' and Id in (${values.map(item => `'${item}'`).join(',')})`)
        }, reject, resolve)
      })
    })
  }

  static RemoveByTempId (values) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        db.transaction(tx => {
          tx.executeSql(`delete from Cliente where empresaId = '${empresa.id}' and tempId in (${values.map(item => `'${item}'`).join(',')})`)
        }, reject, resolve)
      }).catch(err => reject(err))
    })
  }

  static RemoveAll () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        db.transaction(tx => {
          tx.executeSql(`delete from Cliente where empresaId = '${empresa.id}'`)
        }, reject, resolve)
      })
    })
  }

  static Delete () {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        tx.executeSql('delete from Cliente')
      }, reject, resolve)
    })
  }

  static GetListComparacaoAlteracoes () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select id, dataCriacao, dataAlteracao from Cliente where empresaId = '${empresa.id}' and id is not null`

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

        const query = `select id from Cliente where empresaId = '${empresa.id}' and id is not null`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array.map(item => item.id)), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetListAdicionadosEAlterados () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select * from Cliente where empresaId = '${empresa.id}' and idAparelho is not null`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetCount (nomeCliente, cpf) {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'UserInfo', 'Configuracoes'])
        .then(([empresaStr, userInfoStr, configStr]) => {
          const db = Sqlite.getDb()

          const empresa = JSON.parse(empresaStr[1])
          const user = JSON.parse(userInfoStr[1])
          const config = JSON.parse(configStr[1])
          const isByRegion = config[0].clientePorRegiao

          let query = 'select count(c.id) as contagem from Cliente c'
          const clauses = [`c.empresaId = '${empresa.id}' and c.id is not null and (c.nomeRazao like '%${nomeCliente}%' or c.apelido like '%${nomeCliente}%' or c.cpf like '%${cpf}%')`]

          if (isByRegion) {
            clauses.push(`(c.vendedores like '%,${user.idAlphaExpress},%' or c.vendedores = '${user.idAlphaExpress}' or c.vendedores like '%,${user.idAlphaExpress}' or c.vendedores like '${user.idAlphaExpress},%' or c.vendedores is null or c.vendedores = '')`)
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
}
