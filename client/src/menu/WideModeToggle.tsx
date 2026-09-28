import { useAuthStore } from 'utils/store/useAuthStore'
import { useWideModeStore } from 'utils/store/useWideModeStore'

import { ExpandIcon, ShrinkIcon } from '@navikt/aksel-icons'
import { Button } from '@navikt/ds-react'

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

