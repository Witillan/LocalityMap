import * as yup from 'yup'
import { setLocale } from 'yup'

setLocale({
  mixed: {
    required: () => 'Este campo é obrigatório!'
  },
  string: {
    min: ({ min }) => `O campo deve conter no mínimo ${min} carateres!`,
    max: ({ max }) => `O campo não pode exceder ${max} caracteres!`
  }
})

const ValidationItemSchema = yup.object({
  produtoId: yup.string().required(),
  estoqueAtual: yup.number(),
  quantidade: yup.number().nullable(),
  subTotal: yup.number().min(0).required(),
  valorUnitario: yup.number().min(0).required(),
  descontoReal: yup.number().min(0).max(yup.ref('subTotal'), 'Este campo não pode ser superior ao SUBTOTAL').required().typeError('Este campo depende de outro!'),
  acrescimo: yup.number().min(0),
  valorTotal: yup.number().moreThan(0, 'O valor total deve ser maior que 0,01').required(),
  restringirEstoque: yup.boolean()
})

export default ValidationItemSchema
