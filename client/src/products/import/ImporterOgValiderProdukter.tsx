import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useSeriesV2 } from 'api/SeriesApi'
import ErrorAlert from 'error/ErrorAlert'
import { Upload } from 'felleskomponenter/FellesImport'
import ImporterProdukter from 'products/import/ImporterProdukter'
import { ValidateImportedProducts } from 'products/import/valideringsside/ValidateImportedProducts'

import { Loader } from '@navikt/ds-react'

import './import.scss'

export const ImporterOgValiderProdukter = () => {
  const [upload, setUpload] = useState<Upload | undefined>(undefined)
  const { seriesId } = useParams()

  const { data: series, isLoading, error } = useSeriesV2(seriesId!)

  if (isLoading) {
    return (
      <main>
        <div className="import-products">
          <div className="content">
            <Loader size="2xlarge" title="venter..." />
          </div>
        </div>
      </main>
    )
  }

  if (!series || error) {
    return (
      <main className="show-menu">
        <ErrorAlert />
      </main>
    )
  }

  if (!upload) {
    return <ImporterProdukter seriesTitle={series.title} validerImporterteProdukter={setUpload} />
  } else
    return (
      <ValidateImportedProducts
        seriesId={seriesId!}
        seriesTitle={series.title}
        upload={upload}
        reseetUpload={() => {
          setUpload(undefined)
        }}
      />
    )
}
