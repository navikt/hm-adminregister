import { useGet } from '../useGet'
import ScrollToTop from '../components/ScrollToTop'
import { Panel, GuidePanel, LinkPanel, Alert, Loader, Pagination, Detail, Heading, Tag } from '@navikt/ds-react'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { OversiktResponse } from '../types'
import { Dato } from '../components/Dato'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

function useQuery() {
  const { search } = useLocation()
  return React.useMemo(() => new URLSearchParams(search), [search])
}

export function Oversikt() {
  const navigate = useNavigate()
  let setCurrPage = (page: number) => navigate('/oversikt?page=' + page)

  let query = useQuery()
  let currPage = parseInt(query.get('page') || '1')
  if (!currPage || isNaN(currPage)) setCurrPage(1)

  const { data, error } = useGet<OversiktResponse>('/oversikt?page=' + currPage)

  const { t } = useTranslation()

  return (
    <div className="gray-background">
      <ScrollToTop />
      <main>
        <Heading level="1" size="large" style={{ margin: '1em 0', textAlign: 'center' }}>
          {t('oversikt.overskrift')}
        </Heading>
        {!data && !error && (
          <Loader
            variant="neutral"
            size="3xlarge"
            title={t('oversikt.laster')}
            style={{ display: 'block', margin: '2rem auto' }}
          />
        )}
        {!error && data && data.items.length == 0 && (
          <div style={{ marginTop: '2rem' }}>
            <Alert variant="info" size="medium">
              {t('oversikt.ingen_krav')}
            </Alert>
          </div>
        )}
        {!error && data && data.items.length > 0 && (
          <>
            <GuidePanel style={{ marginBottom: '2rem' }}>
              <ul style={{ paddingInlineStart: '12px' }}>
                <li>{t('oversikt.intro.pnkt1')}</li>
                <li>{t('oversikt.intro.pnkt2')}</li>
              </ul>
            </GuidePanel>
            <Panel border={false}>
              <ul
                style={{
                  listStyleType: 'none',
                  paddingInlineStart: 0,
                }}
              >
                {data?.items.map((it, idx) => {
                  return (
                    <li key={idx} style={{ margin: '0.5rem 0' }}>
                      <LinkPanel
                        tabIndex={0}
                        onClick={() => navigate('/oversikt/' + it.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            navigate('/oversikt/' + it.id)
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                        border={false}
                      >
                        <LinkPanel.Title className="navds-heading--small"> {it.barnsNavn} </LinkPanel.Title>
                        {/* TODO: Følge designsystemet og ha svart overskrift som blir blå ved mouseOver? */}
                        <LinkPanel.Description>
                          {t('oversikt.krav_beskrivelse_linje1')} <Dato verdi={it.opprettet} formatLong={true}></Dato>
                          <br />
                          {t('oversikt.krav_beskrivelse_linje2', {
                            orgnavn: it.orgnavn,
                            bestillingsreferanse: it.bestillingsreferanse,
                          })}
                          {it.slettet && (
                            <div style={{ marginTop: '0.5rem' }}>
                              <Tag variant="warning" size="small">
                                {t('oversikt.slettet')} <Dato verdi={it.slettet}></Dato>
                              </Tag>
                            </div>
                          )}
                          {!it.slettet && it.utbetalingsdato && (
                            <div style={{ marginTop: '0.5rem' }}>
                              <Tag variant="success" size="small">
                                {t('oversikt.utbetalt')} <Dato verdi={it.utbetalingsdato}></Dato>
                              </Tag>
                            </div>
                          )}
                          {!it.slettet && !it.utbetalingsdato && it.utbetalingsstatus && (
                            <div style={{ marginTop: '0.5rem' }}>
                              <Tag variant="info" size="small">
                                {t('oversikt.utbetales')}
                              </Tag>
                            </div>
                          )}
                        </LinkPanel.Description>
                      </LinkPanel>
                      <hr style={{ margin: '0.5rem var(--a-spacing-4)' }} />
                    </li>
                  )
                })}
              </ul>
            </Panel>
            <div style={{ textAlign: 'right', margin: '1rem 0 2rem' }}>
              <Detail>
                {t('oversikt.pagination', {
                  totalItems: data.totalItems,
                  fromRow: (currPage - 1) * data.itemsPerPage + 1,
                  toRow: Math.min(currPage * data.itemsPerPage, data.totalItems),
                })}
              </Detail>
            </div>
            {data.numberOfPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PaginationCentering>
                  <Pagination
                    size="medium"
                    page={currPage}
                    onPageChange={(x) => setCurrPage(x)}
                    count={data.numberOfPages}
                    boundaryCount={1}
                    siblingCount={1}
                    prevNextTexts
                  />
                </PaginationCentering>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

const PaginationCentering = styled.div`
  ul.navds-pagination__list {
    justify-content: center;
    flex-wrap: wrap;
  }
  button.navds-pagination--invisible {
    display: none;
  }
`
