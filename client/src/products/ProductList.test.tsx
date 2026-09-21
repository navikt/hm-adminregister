import { MemoryRouter } from 'react-router-dom'

import { axe } from 'jest-axe'
import { server } from 'mocks/server'
import { HttpResponse, http } from 'msw'
import { v4 as uuidv4 } from 'uuid'
import { afterEach, expect, test } from 'vitest'

import { fireEvent, render, screen } from '@testing-library/react'
import { todayIso } from 'utils/export/exportUtils'
import { useAuthStore } from 'utils/store/useAuthStore'

import ProductListWrapper from './ProductListWrapper'

const dummyProduct = (title: string, editStatus: string = 'EDITABLE') => {
  return {
    id: uuidv4(),
    title: title,
    status: editStatus,
    isExpired: false,
    isPublished: false,
    variantCount: 23,
    updated: '2024-05-24T09:54:25.595163',
    updatedByUser: 'system',
  }
}

afterEach(() => {
  useAuthStore.setState({ loggedInUser: undefined })
})

test('Flere produkter', async () => {
  server.use(
    http.get(`http://localhost:8080/admreg/api/v1/series`, (info) => {
      return HttpResponse.json({
        content: [
          dummyProduct('p1', 'EDITABLE'),
          dummyProduct('p2', 'PENDING_APPROVAL'),
          dummyProduct('p3', 'REJECTED'),
          dummyProduct('p4', 'DONE'),
        ],
        pageable: {
          number: 0,
          sort: {
            orderBy: [
              {
                property: 'created',
                direction: 'DESC',
                ignoreCase: false,
                ascending: false,
              },
            ],
          },
          size: 10,
        },
        totalSize: 3,
        totalPages: 1,
        empty: false,
        size: 10,
        offset: 0,
        pageNumber: 0,
        numberOfElements: 3,
      })
    })
  )

  const { container } = render(
    <MemoryRouter>
      <ProductListWrapper />
    </MemoryRouter>
  )

  expect(await screen.findAllByRole('listitem')).toHaveLength(7)

  expect(await screen.findByRole('link', { name: /p1/ })).toHaveTextContent(/23/) //antall varianter
  expect(await screen.findByRole('link', { name: /Under endring/ }))
  expect(await screen.findByRole('link', { name: /Avslått/ }))
  expect(await screen.findByRole('link', { name: /Venter på godkjenning/ }))
  expect(await screen.findByRole('link', { name: /Publisert/ }))

  expect(await axe(container)).toHaveNoViolations()
})

test('oppdaterer standardfilnavnet fra filtre og valg i eksportmodalen', async () => {
  useAuthStore.setState({
    loggedInUser: {
      isAdmin: false,
      isHmsUser: true,
      isAdminOrHmsUser: true,
      isSupplier: false,
      userId: 'user-id',
      supplierId: undefined,
      userName: 'Testbruker',
      supplierName: undefined,
      exp: undefined,
    },
  })
  server.use(
    http.get(`http://localhost:8080/admreg/api/v1/series`, () =>
      HttpResponse.json({
        content: [dummyProduct('p1')],
        totalSize: 1,
        totalPages: 1,
      })
    )
  )

  render(
    <MemoryRouter
      initialEntries={[
        '/produkter?q=rullestol&sort=updated%2CDESC&filters=&inAgreement=false&missingMediaType=VIDEO',
      ]}
    >
      <ProductListWrapper />
    </MemoryRouter>
  )

  fireEvent.click(await screen.findByRole('button', { name: 'Eksporter' }))

  const fileName = await screen.findByRole('textbox', { name: 'Filnavn' })
  expect(fileName).toHaveValue(`produkter_rullestol_uten-avtale_mangler-video_side-1_${todayIso()}`)

  fireEvent.click(screen.getByRole('radio', { name: 'Variant' }))
  expect(fileName).toHaveValue(`varianter_rullestol_uten-avtale_mangler-video_side-1_${todayIso()}`)

  fireEvent.click(screen.getByRole('radio', { name: 'Alle treff' }))
  expect(fileName).toHaveValue(`varianter_rullestol_uten-avtale_mangler-video_alle-treff_${todayIso()}`)

  fireEvent.change(fileName, { target: { value: 'mitt filnavn' } })
  fireEvent.click(screen.getByRole('radio', { name: 'Produkt' }))
  expect(fileName).toHaveValue('mitt filnavn')
})
