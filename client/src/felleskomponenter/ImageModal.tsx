import { Button, Detail, HStack, Label, Modal } from "@navikt/ds-react";
import { MediaInfoDTO } from "utils/types/response-types";
import { mediumImageLoader } from "utils/image-util";
import styles from "./ImageModal.module.scss";
import { ChevronLeftIcon, ChevronRightIcon } from "@navikt/aksel-icons";
import { useEffect, useState } from "react";

interface Props {
  mediaInfo: MediaInfoDTO[];
  index: number;
  onClose: () => void;
  isModalOpen: boolean;
}

const ImageModal = ({ mediaInfo, index, onClose, isModalOpen }: Props) => {
  const [newIndex, setNewIndex] = useState(index);
  const handleMoveLeft = () => {
    setNewIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  };

  const handleMoveRight = () => {
    setNewIndex((prevIndex) => (prevIndex < mediaInfo.length - 1 ? prevIndex + 1 : prevIndex));
  };
  useEffect(() => {
    const handleArrowKeys = (event: KeyboardEvent) => {
      if (isModalOpen && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        if (event.key === "ArrowLeft") {
          handleMoveLeft();
        } else if (event.key === "ArrowRight") {
          handleMoveRight();
        }
      }
    };
    window.addEventListener("keydown", handleArrowKeys);

    return () => {
      window.removeEventListener("keydown", handleArrowKeys);
    };
  }, [isModalOpen, handleMoveLeft, handleMoveRight]);

  const onCloseResetImageBrowsing = () => {
    setNewIndex(index);
    onClose();
  };

  return (
    <Modal
      className={styles.imageModal}
      open={isModalOpen}
      header={{
        heading: "",
        closeButton: true,
      }}
      onClose={onCloseResetImageBrowsing}
    >
      <Modal.Body className={styles.imageModalModalBody}>
        {mediaInfo.length > 1 && (
          <Button
            variant="tertiary"
            icon={<ChevronLeftIcon fontSize="3rem" aria-hidden />}
            className={"leftButton"}
            onClick={handleMoveLeft}
            title="forrige"
          ></Button>
        )}
        <img
          src={mediumImageLoader({ src: mediaInfo[newIndex].uri, width: 800 })}
          onError={() => {}}
          alt={mediaInfo[newIndex].text ?? "OBS mangler alt-tekst"}
        />
        {mediaInfo.length > 1 && (
          <Button
            variant="tertiary"
            icon={<ChevronRightIcon fontSize="3rem" aria-hidden />}
            className={"rightButton"}
            onClick={handleMoveRight}
            title="neste"
          ></Button>
        )}
      </Modal.Body>
      <Label size="medium" textColor="default" spacing style={{ alignSelf: "center" }}>
        Bilde {newIndex + 1} av {mediaInfo.length}
      </Label>
    </Modal>
  );
};

export default ImageModal;
