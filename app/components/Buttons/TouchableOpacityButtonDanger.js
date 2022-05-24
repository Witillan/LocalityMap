import React from 'react'
import { ButtonDisabled, ButtonDanger, LabelWhite } from '../style'

export default function ({ disabled, onSubmit, label, ...rest }) {
  return <>
        {disabled
          ? <ButtonDisabled {...rest} disabled={disabled} onPress={() => onSubmit()}>
                <LabelWhite>{label}</LabelWhite>
            </ButtonDisabled>
          : <ButtonDanger {...rest} disabled={disabled} onPress={() => onSubmit()}>
                <LabelWhite>{label}</LabelWhite>
            </ButtonDanger>
        }
    </>
}
