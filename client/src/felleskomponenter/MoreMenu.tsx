import { MenuElipsisVerticalIcon, PencilWritingIcon, TrashIcon } from '@navikt/aksel-icons'
import { Button, Dropdown } from '@navikt/ds-react'

import styles from './MoreMenu.module.scss'

export const MoreMenu = ({
  id,
  handleDelete,
  handleEdit,
  editText = 'Endre filnavn',
}: {
  id: string
  handleDelete: (id: string) => void
  handleEdit?: (id: string) => void
  editText?: string
}) => {
  return (
    <>
      <Dropdown>
        <Button
          className={styles.button}
          size="small"
          variant="tertiary"
          icon={<MenuElipsisVerticalIcon title="Meny" fontSize="1.5rem" />}
          as={Dropdown.Toggle}
        />
        <Dropdown.Menu className={styles.content}>
          <Dropdown.Menu.List>
            {handleEdit && (
              <Dropdown.Menu.List.Item onClick={() => handleEdit(id)}>
                <PencilWritingIcon fontSize="1.5rem" aria-hidden /> {editText}
              </Dropdown.Menu.List.Item>
            )}
            <Dropdown.Menu.List.Item onClick={() => handleDelete(id)}>
              <TrashIcon fontSize="1.5rem" aria-hidden /> Slett
            </Dropdown.Menu.List.Item>
          </Dropdown.Menu.List>
        </Dropdown.Menu>
      </Dropdown>
    </>
  )
}
