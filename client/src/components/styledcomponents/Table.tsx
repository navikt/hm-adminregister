import styled from 'styled-components'
import { Table } from '@navikt/ds-react'

export const RowBoxTable = styled(Table)`
  border-collapse: separate;
  border-spacing: 0 5px;

  th {
    border: 0;
  }

  td {
    border: 1px solid var(--a-gray-300);
  }

  td:first-child {
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    border-right: 0;
  }

  td:last-child {
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    border-left: 0;
  }

  td:not(:first-child):not(:last-child) {
    border-left: 0;
    border-right: 0;
  }
`