import { Button, Modal } from "@navikt/ds-react";
import Content from "felleskomponenter/styledcomponents/Content";

interface Props {
  title: string;
  text?: string;
  confirmButtonText: string;
  onClick: () => void;
  onClose: () => void;
  isModalOpen: boolean;
  variant?: "danger" | "primary";
}

const ConfirmModal = ({ title, text, onClick, onClose, isModalOpen, confirmButtonText, variant }: Props) => {
  return (
    <Modal
      open={isModalOpen}
      header={{
        heading: title,
        closeButton: false,
      }}
      onClose={onClose}
      width={"30rem"}
    >
      {text && (
        <Modal.Body>
          <Content>{text}</Content>
        </Modal.Body>
      )}
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Avbryt
        </Button>
        <Button onClick={onClick} variant={variant ?? "primary"}>
          {confirmButtonText}
        </Button>

      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
