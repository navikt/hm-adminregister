import {Button, Modal} from "@navikt/ds-react";
import {MediaInfoDTO} from "utils/types/response-types";
import {mediumImageLoader} from "utils/image-util";
import styles from "./ImageModal.module.scss";
import {ChevronLeftIcon, ChevronRightIcon} from "@navikt/aksel-icons";
import {useState} from "react";

interface Props {
    mediaInfo: MediaInfoDTO[];
    index: number;
    onClose: () => void;
    isModalOpen: boolean;
}

const ImageModal = ({mediaInfo, index, onClose, isModalOpen}: Props) => {

    const [newIndex, setNewIndex] = useState(index);
    const onCloseResetImageBrowsing = () => {
        setNewIndex(index);
        onClose();
    }

    const handleMoveLeft = () => {
        setNewIndex((prevIndex) => (prevIndex - 1 + mediaInfo.length) % mediaInfo.length);
    };

    const handleMoveRight = () => {
        setNewIndex((prevIndex) => (prevIndex + 1) % mediaInfo.length);
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
                {(mediaInfo.length > 1) && (
                    <Button
                        variant="tertiary"
                        icon={<ChevronLeftIcon fontSize="3rem" aria-hidden/>}
                        className={"leftButton"}
                        onClick={handleMoveLeft}
                        title="Flytt til venstre"
                    ></Button>
                )}
                <img
                    src={mediumImageLoader({src: mediaInfo[newIndex].uri, width: 800})}
                    onError={() => {
                    }}
                    alt={mediaInfo[newIndex].text ?? "OBS mangler alt-tekst"}
                />
                {(mediaInfo.length > 1) && (
                    <Button
                        variant="tertiary"
                        icon={<ChevronRightIcon fontSize="3rem" aria-hidden/>}
                        className={"rightButton"}
                        onClick={handleMoveRight}
                        title="Flytt til høyre"
                    ></Button>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ImageModal;
