import * as yup from 'yup'
import { setLocale } from 'yup'
import { TipoPessoa } from '../../db/FornecedorDao'

setLocale({
  mixed: {
    required: () => 'Este campo é obrigatório!'
  },
  string: {
    min: ({ min }) => `O campo deve conter no mínimo ${min} carateres!`,
    max: ({ max }) => `O campo não pode exceder ${max} caracteres!`
  }
})

// Verificar se tem algum caracter "/" (barra)
const barRegex = (string) => /['"´`]/.test(string)

const ValidationNewFornecedorSchema = yup.object().shape({
  tipoPessoa: yup.number().required().typeError('Este campo é obrigatório!'),
  nomeRazao: yup.string().required().max(60).test('regexBar1', 'Este campo não pode conter aspas', (value) => !barRegex(value)),
  apelido: yup.string().nullable().max(60).test('regexBar2', 'Este campo não pode conter aspas', (value) => !barRegex(value)),
  rg: yup.string().nullable().max(20),
  cpf: yup.string().max(11).nullable(),
  cnpj: yup.string().max(14).nullable(),
  telefone: yup.string().required().max(35),
  celular: yup.string().nullable().max(35),
  contato: yup.string().nullable().max(35),
  observacao: yup.string().nullable().max(350),
  cep: yup.string().nullable().max(9),
  codigoIbgeCidade: yup.number().required().typeError('Este campo é obrigatório!'),
  uf: yup.string().required().max(2),
  endereco: yup.string().required().max(60),
  numero: yup.string().required().max(10),
  bairro: yup.string().required().max(25),
  complemento: yup.string().nullable().max(60)
}).test('xor', 'CPF/CNPJ deve ter valor!', val => {
  if (val.tipoPessoa === TipoPessoa.PessoaFisica) {
    return !!val.cpf && val.cpf.length === 11
  } else if (val.tipoPessoa === TipoPessoa.PessoaJuridica) {
    return !!val.cnpj && val.cnpj.length === 14
  }
})

export default ValidationNewFornecedorSchema
