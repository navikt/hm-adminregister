import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { baseUrl } from '../http'
import { useTranslation } from 'react-i18next'
import { setBreadcrumbs, onBreadcrumbClick } from '@navikt/nav-dekoratoren-moduler'

const Breadcrumbs = () => {
  const { t } = useTranslation()
  const location = useLocation()
  useEffect(() => {
    const { pathname } = location
    let subBreadcrumbs = []
    if (pathname.indexOf('/oversikt') === 0) {
      subBreadcrumbs.push({ url: '/oversikt', title: t('brødsmuler.oversikt'), handleInApp: true })
      if (pathname.indexOf('/oversikt/') === 0) {
        subBreadcrumbs.push({ url: pathname, title: t('brødsmuler.oversikt.detaljer'), handleInApp: true })
      }
    }
    if (pathname.indexOf('/krav') === 0) {
      subBreadcrumbs.push({ url: '/krav', title: t('brødsmuler.krav'), handleInApp: true })
      if (pathname.indexOf('/krav/oppsummering') === 0) {
        subBreadcrumbs.push({
          url: '/krav/oppsummering',
          title: t('brødsmuler.krav.oppsummering'),
          handleInApp: true,
        })
      }
    }
    setBreadcrumbs([
      { url: 'https://www.nav.no/barnebriller', title: t('brødsmuler.optikers_rolle') },
      { url: '/', title: t('brødsmuler.forside'), handleInApp: true },
      ...subBreadcrumbs,
    ])
  }, [location])

  // For breadcrumbs that have "handleInApp=true" specified we have to ourselves specify how to navigate inside our app.
  const navigate = useNavigate()
  onBreadcrumbClick((bc) => {
    navigate(bc.url)
  })

  return null
}

export default Breadcrumbs
