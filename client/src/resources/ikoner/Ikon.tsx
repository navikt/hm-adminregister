import React from 'react'

import styled from 'styled-components'
import { DocPencilIcon, FilesIcon } from '@navikt/aksel-icons'

export interface IkonProps {
  bgSize?: number
  iconSize?: number
  className?: string
}

export interface IkonBakgrunnProps {
  size: number
}

export const IkonBakgrunn = styled.div<IkonBakgrunnProps>`
  background: #99dead;
  width: ${(props) => props.size || '40'}px;
  height: ${(props) => props.size || '40'}px;
  border-radius: ${(props) => props.size || '40'}px;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const InnsendteKravIkon: React.FC<IkonProps> = ({ bgSize = 62, iconSize = 32 }) => (
  <IkonBakgrunn size={bgSize}>
    <FilesIcon aria-hidden width={iconSize} height={iconSize} />
  </IkonBakgrunn>
)

export const SendKravIkon: React.FC<IkonProps> = ({ bgSize = 62, iconSize = 32 }) => (
  <IkonBakgrunn size={bgSize}>
    <DocPencilIcon aria-hidden width={iconSize} height={iconSize} />
  </IkonBakgrunn>
)
