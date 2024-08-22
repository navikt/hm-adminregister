import styles from "./EditAttachmentMenu.module.scss";
import { Button, Dropdown } from "@navikt/ds-react";
import { MenuElipsisVerticalIcon, PencilWritingIcon, TrashIcon } from "@navikt/aksel-icons";
import { MediaInfo } from "utils/types/response-types";

interface EditAttachmentMenuProps {
  attachmentId: string;
  mediaInfo: MediaInfo;
  handleDeleteFile: (uri: string, attachmentIdToUpdate: string) => void;
  handleEditFileName: (mediaInfo: MediaInfo) => void;
}

export const EditAttachmentMenu = ({
  attachmentId,
  mediaInfo,
  handleEditFileName,
  handleDeleteFile,
}: EditAttachmentMenuProps) => {
  return (
    <div className={styles.editAttachmentMenu}>
      <Dropdown>
        <Button
          className={styles.editAttachmentMenuButton}
          size="small"
          variant="tertiary"
          icon={<MenuElipsisVerticalIcon title="Meny" fontSize="1.5rem" />}
          as={Dropdown.Toggle}
        />
        <Dropdown.Menu className={styles.editAttachmentMenuContent}>
          <Dropdown.Menu.List>
            <Dropdown.Menu.List.Item onClick={() => handleEditFileName(mediaInfo)}>
              <PencilWritingIcon fontSize="1.5rem" aria-hidden /> Endre filnavn
            </Dropdown.Menu.List.Item>
            <Dropdown.Menu.List.Item onClick={() => handleDeleteFile(mediaInfo.uri, attachmentId)}>
              <TrashIcon fontSize="1.5rem" aria-hidden /> Slett
            </Dropdown.Menu.List.Item>
          </Dropdown.Menu.List>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};
