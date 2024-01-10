import { ClockDashedIcon, EyeClosedIcon, EyeIcon } from '@navikt/aksel-icons'
import TagWithIcon, { colors } from './TagWithIcon'

const StatusTag = ({ isPending, isDraft }: { isPending: boolean; isDraft: boolean }) => {
  if (isDraft) {
    return (
      <TagWithIcon icon={<EyeClosedIcon aria-hidden fontSize={'1.5rem'} />} text='Ikke publisert' color={colors.GREY} />
    )
  } else if (isPending) {
    return (
      <TagWithIcon
        icon={<ClockDashedIcon aria-hidden fontSize={'1.5rem'} />}
        text='Venter på godkjenning'
        color={colors.ORANGE}
      />
    )
  } else {
    return <TagWithIcon icon={<EyeIcon aria-hidden fontSize={'1.5rem'} />} text='Publisert' color={colors.GREEN} />
  }
}

export default StatusTag
