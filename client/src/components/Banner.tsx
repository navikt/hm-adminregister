import { Panel } from '@navikt/ds-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface BannerProps {
  children?: React.ReactNode
}

export function Banner(props: BannerProps) {
  const { t } = useTranslation()

  return (
    <BannerContainer>
      <BannerPanel>{props.children}</BannerPanel>
    </BannerContainer>
  )
}

export const BannerContainer = styled.div`
  display: grid;
  place-items: center;
`

export const BannerPanel = styled(Panel)`
  background-color: var(--a-gray-50);
  text-align: center;
  width: 100vw;
`

export const FeilBanner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: var(--a-spacing-2);
`
