import { ProductAgreementRegistrationDTOList, ProductRegistrationDTO } from 'utils/response-types'
import { HM_REGISTER_URL } from 'environments'
import { Upload } from 'produkter/import/ImporterProdukter'

const productImportPathDryrun = (isAdmin: boolean): string =>
  isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/excel/import?dryRun=true`
    : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/product/registrations/excel/import?dryRun=true`

const productImportPath = (isAdmin: boolean): string =>
  isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/excel/import?dryRun=false`
    : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/product/registrations/excel/import?dryRun=false`

export const importProducts =
  async (isAdmin: boolean, upload: Upload, dryRun: boolean): Promise<ProductRegistrationDTO[]> => {

    const formData = new FormData()
    formData.append('file', upload.file)

    const response = await fetch(dryRun ? productImportPathDryrun(isAdmin) : productImportPath(isAdmin), {
      method: 'POST',
      headers: {
        accept: 'application/json',
      },
      credentials: 'include',
      body: formData,
    })

    if (response.ok) {
      return await response.json()
    } else {
      const error = await response.json()
      return Promise.reject(error)
    }
  }
