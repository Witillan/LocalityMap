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
  quantidade: yup.number().when('restringirEstoque', {
    is: true,
    then: yup.number().min(0.01, 'Este campo não pode conter quantidade inferior a ${min}').max(yup.ref('estoqueAtual'), 'Este campo não pode ser superior ao Estoque Atual/Disponível').required().typeError('Este campo é obrigatório!')
  }),
  subTotal: yup.number().min(0).required(),
  valorUnitario: yup.number().min(0).required(),
  descontoReal: yup.number().min(0).max(yup.ref('subTotal'), 'Este campo não pode ser superior ao SUBTOTAL').required().typeError('Este campo depende de outro!'),
  descontoPercentual: yup.number().min(0).lessThan(100, 'O valor não pode ser maior que 99.99%').required(),
  valorTotal: yup.number().moreThan(0, 'O valor total deve ser maior que 0,01').required(),
  restringirEstoque: yup.boolean()
})

export default ValidationItemSchema
