import * as yup from 'yup'
import { setLocale } from 'yup'

setLocale({
  mixed: {
    required: () => 'Este campo é obrigatório!'
  },
  string: {
    min: ({ min }) => `O campo deve conter no mínimo ${min} carateres!`,
    max: ({ max }) => `O campo não pode exceder ${max} caracteres!`,
    lessThan: ({ lessThan }) => `O valor deste campo não pode ser maior do que ${lessThan}!`
  },
  number: {
    nullable: () => 'Este campo precisa ter um valor!'
  }
})

const ValidationItemSchema = yup.object({
  produtoId: yup.string().required(),
  quantidade: yup.number().min(0).required().typeError('Este campo é obrigatório!').nullable(false),
  valorUnitario: yup.number().min(0).required(),
  descontoReal: yup.number().min(0).required(),
  descontoPercentual: yup.number().min(0).required(),
  valorTotal: yup.number().min(0).required()
})

const ValidationNewPedidoSchema = yup.object({
  clienteId: yup.string().nullable().required(),
  dataEHora: yup.string(),
  subTotal: yup.number().moreThan(0, 'O subTotal total do pedido deve ter valor maior que 0').required(),
  descontoReal: yup.number().min(0).required(),
  descontoPercentual: yup.number().min(0).lessThan(100, 'O percentual deve ser menor do que 100').required(),
  total: yup.number().moreThan(0, 'O valor total do pedido deve ter valor maior que 0').required(),
  anotacoes: yup.string().max(350),
  formaPagamentoId: yup.string().required(),
  itens: yup.array().of(ValidationItemSchema)
    .label('Itens')
    .min(1, 'É obrigatório ter, pelo menos, ${min} item!')
    .max(99, 'O máximo de itens permitidos é ${max}!')
    .required()
})

export default ValidationNewPedidoSchema
