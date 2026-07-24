import React from 'react'

import { toDate, toReadableDateString } from 'utils/date-util'
import type { AgreementRegistrationDTO } from 'utils/types/response-types'

import { ClockDashedIcon, EyeClosedIcon, EyeIcon } from '@navikt/aksel-icons'

import LocalTag, { colors } from '../../felleskomponenter/LocalTag'

export type AgreementStatusData = Pick<AgreementRegistrationDTO, 'draftStatus' | 'published' | 'expired'>

type StatusTagConfig = {
  Icon: React.ComponentType<{ 'aria-hidden'?: boolean; fontSize?: string }>
  text: string
  color: colors
}

export const getStatusTagConfig = (
  { draftStatus, published, expired }: AgreementStatusData,
  now = new Date()
): StatusTagConfig => {
  if (draftStatus === 'DRAFT') {
    return {
      Icon: EyeClosedIcon,
      text: 'Ikke publisert (kladd)',
      color: colors.GREY,
    }
  }

  if (!published || !expired) {
    return {
      Icon: EyeClosedIcon,
      text: 'Status utilgjengelig',
      color: colors.GREY,
    }
  }

  const publishedDate = toDate(published)
  const expiredDate = toDate(expired)

  if (Number.isNaN(publishedDate.getTime()) || Number.isNaN(expiredDate.getTime())) {
    return {
      Icon: EyeClosedIcon,
      text: 'Status utilgjengelig',
      color: colors.GREY,
    }
  }

  if (expiredDate <= now) {
    return {
      Icon: EyeClosedIcon,
      text: 'Utgått',
      color: colors.GREY,
    }
  }

  if (publishedDate > now) {
    return {
      Icon: ClockDashedIcon,
      text: `Publisert – aktiv fra ${toReadableDateString(published)}`,
      color: colors.ORANGE,
    }
  }

  return {
    Icon: EyeIcon,
    text: 'Publisert',
    color: colors.GREEN,
  }
}

const AgreementStatusTag = ({ agreement }: { agreement: AgreementStatusData }) => {
  const { Icon, text, color } = getStatusTagConfig(agreement)

  return <LocalTag icon={<Icon aria-hidden fontSize="1.5rem" />} text={text} color={color} />
}

export default AgreementStatusTag
