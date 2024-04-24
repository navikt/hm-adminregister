import { Modal } from "@navikt/ds-react";
import "./error-modal.scss";
import { MediaInfoDTO } from "utils/types/response-types";
import { largeImageLoader, mediumImageLoader } from "utils/image-util";

interface Props {
  mediaInfo: MediaInfoDTO;
  onClose: () => void;
  isModalOpen: boolean;
}

const ImageModal = ({ mediaInfo, onClose, isModalOpen }: Props) => {
  return (
    <Modal
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
