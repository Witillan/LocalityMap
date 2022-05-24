import React from 'react'
import { ButtonDisabled, ButtonSuccess, LabelWhite } from '../style'

export default function ({ disabled, onSubmit, label, ...rest }) {
  return <>
        {disabled
          ? <ButtonDisabled {...rest} disabled={disabled} onPress={() => onSubmit()}>
                <LabelWhite>{label}</LabelWhite>
            </ButtonDisabled>
          : <ButtonSuccess {...rest} disabled={disabled} onPress={() => onSubmit()}>
                <LabelWhite>{label}</LabelWhite>
            </ButtonSuccess>
        }
    </>
}
