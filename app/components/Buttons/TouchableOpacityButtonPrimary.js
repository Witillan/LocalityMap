import React from 'react'
import { ButtonDisabled, ButtonPrimary, LabelWhite } from '../style'

export default function ({ disabled, onSubmit, label, ...rest }) {
  return <>
        {disabled
          ? <ButtonDisabled {...rest} disabled={disabled} onPress={() => onSubmit()}>
                <LabelWhite>{label}</LabelWhite>
            </ButtonDisabled>
          : <ButtonPrimary {...rest} disabled={disabled} onPress={() => onSubmit()}>
                <LabelWhite>{label}</LabelWhite>
            </ButtonPrimary>
        }
    </>
}
