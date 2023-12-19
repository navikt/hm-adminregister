import { Link, LinkProps } from '@navikt/ds-react'
import { logNavigeringLenke } from '../utils/amplitude'

export function LenkeMedLogging(props: LinkProps) {
  const { children, ...rest } = props
  return (
    <Link
      onClick={() => {
        logNavigeringLenke(props.href || '')
      }}
      {...rest}
    >
      {children}
    </Link>
  )
}
