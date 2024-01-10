import React, { useState } from 'react'
import classNames from 'classnames'
import ProfileMenu from './ProfileMenu'
import { Buldings3Icon, MenuHamburgerIcon, PackageFillIcon, PencilLineIcon, XMarkIcon } from '@navikt/aksel-icons'
import { Button, HStack, VStack } from '@navikt/ds-react'
import { useHydratedAuthStore } from '../../utils/store/useAuthStore'
import { useUser } from '../../utils/swr-hooks'
import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className={classNames('menu', { open: menuOpen })}>
      <div className='menu__logo'>Finn Hjelpemiddel (admin)</div>
      <Button
        className='menu__burgermenu-button'
        icon={
          menuOpen ? (
            <XMarkIcon title='Lukk menyen' />
          ) : (
            <MenuHamburgerIcon title='Åpne menyen' style={{ color: '#272a3a' }} />
          )
        }
        variant='tertiary'
        onClick={() => setMenuOpen(!menuOpen)}
      />
      <VStack gap='32' className='menu__desktop'>
        <NavigationLinks menuOpen={true} />
        <ProfileMenu />
      </VStack>
      <div className={classNames('menu__mobile', { open: menuOpen })}>
        <NavigationLinks menuOpen={menuOpen} />
        {menuOpen && <ProfileMenu />}
      </div>
    </nav>
  )
}
export default Navbar

const NavigationLinks = ({ menuOpen }: { menuOpen: boolean }) => {
  const { pathname } = useLocation()
  const { loggedInUser } = useHydratedAuthStore()
  const { user, userError, userIsLoading } = useUser(loggedInUser)

  if (!menuOpen) {
    return <></>
  }
  return (
    <VStack className='menu__nav-links'>
      {user && user.roles.includes('ROLE_ADMIN') && (
        <>
          <Link
            to='/leverandor'
            className={classNames('page-link', { 'page-link--active': pathname === '/leverandor' })}
            aria-selected={pathname === '/leverandor'}
          >
            {pathname === '/leverandor' && <div className='active' />}
            <div className='line' />
            <HStack gap='4' style={{ paddingLeft: '16px' }}>
              <Buldings3Icon fontSize={'1.5rem'} />
              <span>Leverandører</span>
            </HStack>
          </Link>
          <Link
            to='/rammeavtaler'
            className={classNames('page-link', { 'page-link--active': pathname === '/rammeavtaler' })}
            aria-selected={pathname === '/rammeavtaler'}
          >
            {pathname === '/rammeavtaler' && <div className='active' />}
            <div className='line' />
            <HStack gap='4' style={{ paddingLeft: '16px' }}>
              <PencilLineIcon title='a11y-title' fontSize='1.5rem' />
              <span>Rammeavtaler</span>
            </HStack>
          </Link>
        </>
      )}

      <Link
        to='/produkter'
        className={classNames('page-link', { 'page-link--active': pathname === '/produkter' })}
        aria-selected={pathname === '/produkter'}
      >
        {pathname === '/produkter' && <div className='active' />}
        <div className='line' />
        <HStack gap='4' style={{ paddingLeft: '16px' }}>
          <PackageFillIcon fontSize={'1.5rem'} />
          <span>Produkter</span>
        </HStack>
      </Link>
      {/* todo: Legg til tilbehør */}
      {/*<Link*/}
      {/*  to='/tilbehor'*/}
      {/*  className={classNames('page-link', { 'page-link--active': pathname === '/tilbehor' })}*/}
      {/*  aria-selected={pathname === '/tilbehor'}*/}
      {/*>*/}
      {/*  {pathname === '/tilbehor' && <div className='active' />}*/}
      {/*  <div className='line' />*/}
      {/*  <HStack gap='4' style={{ paddingLeft: '16px' }}>*/}
      {/*    <WrenchIcon fontSize={'1.5rem'} />*/}
      {/*    <span>Tilbehør</span>*/}
      {/*  </HStack>*/}
      {/*</Link>*/}
    </VStack>
  )
}
