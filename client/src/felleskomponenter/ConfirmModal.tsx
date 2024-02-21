import { Button, Modal } from "@navikt/ds-react";
import "./error-modal.scss";
import Content from "felleskomponenter/styledcomponents/Content";

interface Props {
  title: string;
  text: string;
  onClick: () => void;
  onClose: () => void;
  isModalOpen: boolean;
}

const ConfirmModal = ({ title, text, onClick, onClose, isModalOpen }: Props) => {
  return (
    <Modal
      open={isModalOpen}
      header={{
        heading: title,
        closeButton: false,
      }}
      onClose={onClose}
    >
      <Modal.Body>
        <Content>{text}</Content>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="tertiary" onClick={onClose}>
          Avbryt
        </Button>
        <Button onClick={onClick} variant="danger">
          Slett
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
