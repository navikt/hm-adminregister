import { Modal } from "@navikt/ds-react";
import "./error-modal.scss";
import { MediaInfoDTO } from "utils/types/response-types";
import { mediumImageLoader } from "utils/image-util";
import styles from "./ImageModal.module.scss";

interface Props {
  mediaInfo: MediaInfoDTO;
  onClose: () => void;
  isModalOpen: boolean;
}

const ImageModal = ({ mediaInfo, onClose, isModalOpen }: Props) => {
  return (
    <Modal
      className={styles.imageModal}
      width="100%"
      open={isModalOpen}
      header={{
        heading: "",
        closeButton: true,
      }}
      onClose={onClose}
    >
      <Modal.Body>
        <img
          src={mediumImageLoader({ src: mediaInfo.uri, width: 800 })}
          onError={() => {}}
          alt={mediaInfo.text ?? "OBS mangler alt-tekst"}
        />
      </Modal.Body>
    </Modal>
  );
};

export default ImageModal;
