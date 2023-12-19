import { dato } from '../dato'

export interface DatoProps {
  verdi?: Date | number | string
  formatLong?: boolean
}

export function Dato(props: DatoProps) {
  const { verdi, formatLong } = props
  return verdi ? <>{dato.formater(verdi, formatLong)}</> : null
}
