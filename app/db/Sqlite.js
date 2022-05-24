import * as SQLite from 'expo-sqlite'

export default class Sqlite {
  static getDb () {
    return SQLite.openDatabase('VendasMobile')
  }

  static runDDL () {
    const db = this.getDb()

    // Executando transaction da DDL do banco
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(`create table if not exists Cidade (
        codigoIbge int primary key not null,
        nome text,
        uf text
      )`)

        tx.executeSql(`create table if not exists Cliente (
        tempId text primary key not null,
        id text,
        idAlphaExpress int,
        nomeRazao text,
        apelido text,
        tipoPessoa int,
        cpf text,
        rg text,
        codigoIbgeCidade int,
        endereco text,
        numero text,
        bairro text,
        cep text,
        complemento text,
        telefone text,
        celular text,
        contato text,
        observacao text,
        idAparelho text,
        inativo text,
        bloqueado text,
        sincronizado int,
        empresaId text,
        vendedores text, 
        dataCriacao text,
        dataAlteracao text,
        foreign key (codigoIbgeCidade) references Cidade (codigoIbge) on delete no action on update no action
      )`)

        tx.executeSql(`create table if not exists FormaPagamento (
        id text primary key not null,
        idAlphaExpress int,
        nome text,
        tipo int,
        empresaId text,
        dataCriacao text,
        dataAlteracao text
      )`)

        tx.executeSql(`create table if not exists GrupoProduto (
        id text primary key not null,
        idAlphaExpress int,
        nome text,
        empresaId text,
        dataCriacao text,
        dataAlteracao text
      )`)

        tx.executeSql(`create table if not exists MarcaProduto (
        id text primary key not null,
        idAlphaExpress int,
        nome text,
        empresaId text,
        dataCriacao text,
        dataAlteracao text
        )`)

        tx.executeSql(`create table if not exists UnidadeProduto (
        id text primary key not null,
        idAlphaExpress int,
        nome text,
        empresaId text,
        dataCriacao text,
        dataAlteracao text
        )`)

        tx.executeSql(`create table if not exists Pedido (
        tempId text primary key not null,
        id text,
        idAlphaExpress int,
        numeroPedido int,
        clienteId text,
        dataEHora string,
        subTotal numeric,
        descontoReal numeric,
        descontoPercentual numeric,
        total numeric,
        anotacoes text,
        sincronizado int,
        subEmpresaId text,
        formaPagamentoId text,
        usuarioCriacaoId int,
        usuarioAlteracaoId int,
        fechado int default(1),
        latitude numeric,
        longitude numeric,
        precisaoLocalizacao numeric,
        idAparelho text,
        empresaId text,
        dataCriacao text,
        dataAlteracao text,
        foreign key (clienteId) references Cliente (id) on delete no action on update no action,
        foreign key (formaPagamentoId) references FormaPagamento (id) on delete no action on update no action
      )`)

        tx.executeSql(`create table if not exists PedidoItem (
        tempId text primary key not null,
        id text,
        idAlphaExpress int,
        tempPedidoId text,
        pedidoId text,
        produtoId text,
        quantidade numeric,
        valorUnitario numeric,
        descontoReal numeric,
        descontoPercentual numeric,
        valorTotal numeric,
        empresaId text,
        foreign key (tempPedidoId) references Pedido (tempId) on delete cascade on update no action
      )`)

        tx.executeSql(`create table if not exists HistoricoPedido (
        id text primary key not null,
        idAlphaExpress int,
        clienteId text,
        dataEHora string,
        subTotal numeric,
        descontoReal numeric,
        descontoPercentual numeric,
        total numeric,
        anotacoes text,
        sincronizado int,
        subEmpresaId text,
        formaPagamentoId text,
        empresaId text,
        dataCriacao text,
        dataAlteracao text,
        foreign key (clienteId) references Cliente (id) on delete no action on update no action,
        foreign key (formaPagamentoId) references FormaPagamento (id) on delete no action on update no action
      )`)

        tx.executeSql(`create table if not exists HistoricoPedidoItem (
        id textprimary key not null,
        idAlphaExpress int,
        pedidoId text,
        produtoId text,
        quantidade numeric,
        valorUnitario numeric,
        descontoReal numeric,
        descontoPercentual numeric,
        valorTotal numeric,
        empresaId text,
        foreign key (pedidoId) references HistoricoPedido (id) on delete cascade on update no action
      )`)

        tx.executeSql(`create table if not exists Produto (
        id text primary key not null,
        idAlphaExpress int,
        codigoInterno text,
        codigoFabrica text,
        nome text,
        unidadeId text,
        marcaId text,
        grupoId text,
        valorVenda numeric,
        fracionado text,
        inativo int,
        empresaId text,
        dataCriacao text,
        dataAlteracao text,
        fotoBase64 text,
        foreign key (unidadeId) references UnidadeProduto (id) on delete no action on update no action,
        foreign key (marcaId) references MarcaProduto (id) on delete no action on update no action,
        foreign key (grupoId) references GrupoProduto (id) on delete no action on update no action
      )`)

        tx.executeSql(`create table if not exists Estoque (
        id text primary key not null,
        idAlphaExpress int,
        quantidade numeric,
        subEmpresaId text,
        produtoId text,
        empresaId text,
        dataCriacao text,
        dataAlteracao text,
        foreign key (produtoId) references Produto (id) on delete no action on update no action
      )`)

        tx.executeSql(`create table if not exists TabelaPreco (
        id text primary key not null,
        idAlphaExpress int,
        numero text,
        nome text,
        validade text,
        empresaId text,
        dataCriacao text,
        dataAlteracao text
        )`)

        tx.executeSql(`create table if not exists TabelaPrecoProduto (
        id text primary key not null,
        idAlphaExpress int,
        produtoId text,
        tabelaPrecoId text,
        valor numeric,
        empresaId text,
        dataCriacao text,
        dataAlteracao text,
        foreign key (produtoId) references Produto (id) on delete cascade on update no action,
        foreign key (tabelaPrecoId) references TabelaProduto (id) on delete cascade on update no action
        )`)

        tx.executeSql(`create table if not exists Financeiro (
        id text primary key not null,
        idAlphaExpress int,
        numero int,
        tipoDocumento text,
        clienteId text,
        subEmpresaId text,
        valor numeric,
        dataVencimento text,
        dataPagamento text,
        situacao text,
        empresaId text,
        dataCriacao text,
        dataAlteracao text,
        foreign key (clienteId) references Cliente (id) on delete no action on update no action
      )`)

        tx.executeSql(`create table if not exists Log (
        tempId text primary key not null,
        idAlphaExpress int,
        mensagem text,
        subEmpresaId text,
        foreign key (subEmpresaId) references SubEmpresa (id) on delete cascade on update no action
      )`)

        tx.executeSql(`create table if not exists Fornecedor (
        tempId text primary key not null,
        id text,
        idAlphaExpress int,
        nomeRazao text,
        apelido text,
        tipoPessoa int,
        cpf text,
        rg text,
        codigoIbgeCidade int,
        endereco text,
        numero text,
        bairro text,
        cep text,
        complemento text,
        telefone text,
        celular text,
        contato text,
        observacao text,
        idAparelho text,
        inativo text,
        bloqueado text,
        sincronizado int,
        empresaId text,
        vendedores text, 
        dataCriacao text,
        dataAlteracao text,
        foreign key (codigoIbgeCidade) references Cidade (codigoIbge) on delete no action on update no action
      )`)

        tx.executeSql(`create table if not exists Compra (
        tempId text primary key not null,
        id text,
        idAlphaExpress int,
        numeroCompra int,
        fornecedorId text,
        dataEHora string,
        subTotal numeric,
        descontoReal numeric,
        acrescimo numeric,
        total numeric,
        anotacoes text,
        sincronizado int,
        subEmpresaId text,
        formaPagamentoId text,
        usuarioCriacaoId int,
        usuarioAlteracaoId int,
        fechado int default(1),
        latitude numeric,
        longitude numeric,
        precisaoLocalizacao numeric,
        idAparelho text,
        empresaId text,
        dataCriacao text,
        dataAlteracao text,
        foreign key (fornecedorId) references Fornecedor (id) on delete no action on update no action,
        foreign key (formaPagamentoId) references FormaPagamento (id) on delete no action on update no action
      )`)

        tx.executeSql(`create table if not exists CompraItem (
        tempId text primary key not null,
        id text,
        idAlphaExpress int,
        tempCompraId text,
        compraId text,
        produtoId text,
        quantidade numeric,
        valorUnitario numeric,
        descontoReal numeric,
        acrescimo numeric,
        valorTotal numeric,
        empresaId text,
        foreign key (tempCompraId) references Compra (tempId) on delete cascade on update no action
      )`)

        tx.executeSql(`create table if not exists HistoricoCompra (
        id text primary key not null,
        idAlphaExpress int,
        fornecedorId text,
        dataEHora string,
        subTotal numeric,
        descontoReal numeric,
        acrescimo numeric,
        total numeric,
        anotacoes text,
        sincronizado int,
        subEmpresaId text,
        formaPagamentoId text,
        empresaId text,
        dataCriacao text,
        dataAlteracao text,
        foreign key (fornecedorId) references Fornecedor (id) on delete no action on update no action,
        foreign key (formaPagamentoId) references FormaPagamento (id) on delete no action on update no action
      )`)

        tx.executeSql(`create table if not exists HistoricoCompraItem (
        id textprimary key not null,
        idAlphaExpress int,
        compraId text,
        produtoId text,
        quantidade numeric,
        valorUnitario numeric,
        descontoReal numeric,
        acrescimo numeric,
        valorTotal numeric,
        empresaId text,
        foreign key (compraId) references HistoricoCompra (id) on delete cascade on update no action
      )`)
      }, error => {
        reject(error)
      }, () => {
        resolve()
      })
    })
  }

  static addNewColumns () {
    const db = this.getDb()

    // Executando transaction da DDL do banco
    return new Promise((resolve) => {
      db.exec([
        {
          sql: 'ALTER TABLE Produto ADD COLUMN tipoProduto int;',
          args: []
        },
        {
          sql: 'ALTER TABLE Produto ADD COLUMN promocao int;',
          args: []
        },
        {
          sql: 'ALTER TABLE Produto ADD COLUMN valorPromocao numeric;',
          args: []
        },
        {
          sql: 'ALTER TABLE FormaPagamento ADD COLUMN tabelaPrecoId text;',
          args: []
        },
        {
          sql: 'ALTER TABLE Produto ADD COLUMN inicioPromocao text;',
          args: []
        },
        {
          sql: 'ALTER TABLE Produto ADD COLUMN finalPromocao text;',
          args: []
        },
        {
          sql: 'ALTER TABLE Pedido ADD COLUMN revertido text;',
          args: []
        },
        {
          sql: 'ALTER TABLE Cliente ADD COLUMN aviso text;',
          args: []
        },
        {
          sql: 'ALTER TABLE Fornecedor ADD COLUMN aviso text;',
          args: []
        },
        {
          sql: 'ALTER TABLE Produto ADD COLUMN aviso text;',
          args: []
        },
        {
          sql: 'ALTER TABLE Produto ADD COLUMN valorCompra numeric;',
          args: []
        }
      ], false, resolve)
      resolve()
    })
  }
}
