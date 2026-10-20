import { fetchAPIWithHeaders, fetchAPIWithHeadersAndArrayBufferResponse, getPath } from 'api/fetch'
import { Upload } from 'felleskomponenter/FellesImport'
import { MIME_TYPE_XLSX } from 'utils/file-util'
import { IsoVersion, withIsoVersion } from 'utils/iso-version'
import { CatalogImportResultReport, ProductRegistrationDTO } from 'utils/types/response-types'

export const exportProducts = async (
  isAdmin: boolean,
  seriesId: string,
  isoVersion: IsoVersion = 'v16'
): Promise<any> => {
  return await fetchAPIWithHeadersAndArrayBufferResponse(
    withIsoVersion(getPath(isAdmin, `/api/v1/product/registrations/excel/export/supplier/${seriesId}`), isoVersion),
    'POST',
    undefined,
    {
      accept: MIME_TYPE_XLSX,
    }
  )
}

export const importProducts = async (
  isAdmin: boolean,
  seriesId: string,
  upload: Upload,
  dryRun: boolean,
  isoVersion: IsoVersion = 'v16'
): Promise<ProductRegistrationDTO[]> => {
  const formData = new FormData()
  formData.append('file', upload.file)

  return await fetchAPIWithHeaders(
    withIsoVersion(
      getPath(
        isAdmin,
        dryRun
          ? `/api/v1/product/registrations/excel/import-dryrun/${seriesId}`
          : `/api/v1/product/registrations/excel/import/${seriesId}`
      ),
      isoVersion
    ),
    'POST',
    formData,
    {
      accept: 'application/json',
    }
  )
}

export const importKatalogfil = async (
  upload: Upload,
  dryRun: boolean,
  supplier: string
): Promise<CatalogImportResultReport> => {
  const formData = new FormData()
  formData.append('file', upload.file)

  return await fetchAPIWithHeaders(
    getPath(
      true,
      dryRun
        ? `/api/v1/catalog-file/excel-import?dryRun=true&supplierId=${supplier}`
        : `/api/v1/catalog-file/excel-import?dryRun=false&supplierId=${supplier}`
    ),
    'POST',
    formData,
    {
      accept: 'application/json',
    }
  )
}
