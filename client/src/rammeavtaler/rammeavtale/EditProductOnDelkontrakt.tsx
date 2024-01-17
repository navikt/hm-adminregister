import { Button, Dropdown } from '@navikt/ds-react'
import { MenuElipsisVerticalIcon } from '@navikt/aksel-icons'


export const EditProductOnDelkontrakt = () => {

  return (
    <Dropdown>
      <Button
        variant='tertiary'
        icon={
          <MenuElipsisVerticalIcon
            title='Rediger'
            fontSize='1.5rem'
          />
        }
        style={{ marginLeft: 'auto' }}
        as={Dropdown.Toggle} />
      <Dropdown.Menu>
        <Dropdown.Menu.GroupedList>
          <Dropdown.Menu.GroupedList.Item onClick={() => {
          }}>
            Rediger
          </Dropdown.Menu.GroupedList.Item>
        </Dropdown.Menu.GroupedList>
        <Dropdown.Menu.Divider />
        <Dropdown.Menu.List>
          <Dropdown.Menu.List.Item href='https://nav.no'>
            Slett
          </Dropdown.Menu.List.Item>
        </Dropdown.Menu.List>
      </Dropdown.Menu>
    </Dropdown>
  )
}