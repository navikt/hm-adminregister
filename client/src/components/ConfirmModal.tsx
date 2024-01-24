import { Button, Modal } from '@navikt/ds-react'
import './error-modal.scss'

interface Props {
  title: string
  text: string
  onClick: () => void
  onClose: () => void
  isModalOpen: boolean
}

const ConfirmModal = ({ title, text, onClick, onClose, isModalOpen }: Props) => {

  return (
    <Modal
      className='error-modal'
      open={isModalOpen}
      header={{
        heading: title,
        closeButton: false,
      }}
      onClose={onClose}
    >
      <Modal.Body>{text}</Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>
          Avbryt
        </Button>
        <Button onClick={onClick}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmModal
