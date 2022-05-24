import React from 'react'
import { ButtonDisabled, ButtonWarning, LabelWhite } from '../style'

export default function ({ disabled, onSubmit, label, ...rest }) {
  return <>
        {disabled
          ? <ButtonDisabled {...rest} disabled={disabled} onPress={() => onSubmit()}>
                <LabelWhite>{label}</LabelWhite>
            </ButtonDisabled>
          : <ButtonWarning {...rest} disabled={disabled} onPress={() => onSubmit()}>
                <LabelWhite>{label}</LabelWhite>
            </ButtonWarning>
        }
    </>
}
