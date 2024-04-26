import { MenuElipsisVerticalIcon, PencilWritingIcon, TrashIcon } from "@navikt/aksel-icons";
import { Button, Popover, VStack } from "@navikt/ds-react";
import { useRef, useState } from "react";
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
  const buttonRef = useRef<SVGSVGElement>(null);
  const [openPopover, setOpenPopover] = useState(false);
  return (
    <>
      <MenuElipsisVerticalIcon
        title="meny"
        aria-expanded={openPopover}
        ref={buttonRef}
        onClick={() => setOpenPopover(!openPopover)}
        fontSize="1.5rem"
      />
      <Popover
        className="more-menu"
        open={openPopover}
        onClose={() => setOpenPopover(false)}
        anchorEl={buttonRef.current}
        offset={20}
        arrow={true}
        placement="bottom"
        flip={false}
      >
        <Popover.Content>
          <VStack>
            {handleEditFileName && (
              <Button
                size="small"
                variant="tertiary"
                onClick={() => handleEditFileName(mediaInfo.uri)}
                icon={<PencilWritingIcon title="rediger" fontSize="1.5rem" />}
              >
                Rediger filnavn
              </Button>
            )}

            <Button
              size="small"
              variant="tertiary"
              onClick={() => handleDeleteFile(mediaInfo.uri)}
              icon={<TrashIcon title="slett" fontSize="1.5rem" />}
            >
              Slett
            </Button>
          </VStack>
        </Popover.Content>
      </Popover>
    </>
  );
};
