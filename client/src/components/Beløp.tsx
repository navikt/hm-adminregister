import { beløp } from '../beløp'

export interface BeløpProps {
  verdi?: number | string
}

export function Beløp(props: BeløpProps) {
  const { verdi } = props
  return verdi ? <>{beløp.formater(verdi)}</> : null
}
