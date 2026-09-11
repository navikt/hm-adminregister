import { useAuthStore } from 'utils/store/useAuthStore'
import { useWideModeStore } from 'utils/store/useWideModeStore'

import { ExpandIcon, ShrinkIcon } from '@navikt/aksel-icons'
import { Button } from '@navikt/ds-react'

// A small, self-contained control that lets logged-in admin users opt in to a wider layout for
// the variant-comparison table in VariantsTab (via Product.tsx reading useWideModeStore
// directly), without touching the sidebar/menu itself in any way. Rendered once in Navbar,
// outside of <nav>, so it shows up next to the page content rather than being part of the
// sidebar. Intentionally does not affect any other page or tab.
const WideModeToggle = () => {
  const { loggedInUser } = useAuthStore()
  const { wideMode, toggleWideMode } = useWideModeStore()

  if (!loggedInUser?.isAdmin) {
    return null
  }

  return (
    <Button
      className="wide-mode-toggle"
      variant="tertiary"
      size="small"
      icon={
        wideMode ? <ShrinkIcon title="Gå tilbake til normal visning" /> : <ExpandIcon title="Bruk bred visning" />
      }
      onClick={toggleWideMode}
    >
      {wideMode ? 'Normal visning' : 'Bred visning'}
    </Button>
  )
}

export default WideModeToggle

