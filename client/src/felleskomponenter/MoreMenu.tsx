import { MenuElipsisVerticalIcon, PencilWritingIcon, TrashIcon } from "@navikt/aksel-icons";
import { Button, Dropdown } from "@navikt/ds-react";
import "./more-menu.scss";
import { MediaInfoDTO } from "utils/types/response-types";

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
    <div className="more-menu">
      <Dropdown>
        <Button
          className="more-menu-button"
          size="small"
          variant="tertiary"
          icon={<MenuElipsisVerticalIcon title="Meny" fontSize="1.5rem" />}
          as={Dropdown.Toggle}
        />
        <Dropdown.Menu className="more-menu-content">
          <Dropdown.Menu.List>
            {handleEditFileName && (
              <Dropdown.Menu.List.Item onClick={() => handleEditFileName(mediaInfo.uri)}>
                <PencilWritingIcon title="rediger" fontSize="1.5rem" /> Endre filnavn
              </Dropdown.Menu.List.Item>
            )}
            <Dropdown.Menu.List.Item onClick={() => handleDeleteFile(mediaInfo.uri)}>
              <TrashIcon title="slett" fontSize="1.5rem" /> Slett
            </Dropdown.Menu.List.Item>
          </Dropdown.Menu.List>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};
