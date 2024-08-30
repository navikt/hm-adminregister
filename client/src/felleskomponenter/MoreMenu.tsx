import { MenuElipsisVerticalIcon, PencilWritingIcon, TrashIcon } from "@navikt/aksel-icons";
import { Button, Dropdown } from "@navikt/ds-react";
import { MediaInfoDTO } from "utils/types/response-types";
import styles from "./MoreMenu.module.scss";

export const MoreMenu = ({
  mediaInfo,
  handleDeleteFile,
  handleEditFileName,
}: {
  mediaInfo: MediaInfoDTO;
  handleDeleteFile: (uri: string) => void;
  handleEditFileName?: (uri: string) => void;
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
            {handleEditFileName && (
              <Dropdown.Menu.List.Item onClick={() => handleEditFileName(mediaInfo.uri)}>
                <PencilWritingIcon fontSize="1.5rem" aria-hidden /> Endre filnavn
              </Dropdown.Menu.List.Item>
            )}
            <Dropdown.Menu.List.Item onClick={() => handleDeleteFile(mediaInfo.uri)}>
              <TrashIcon fontSize="1.5rem" aria-hidden /> Slett
            </Dropdown.Menu.List.Item>
          </Dropdown.Menu.List>
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};
