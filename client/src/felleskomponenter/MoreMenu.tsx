import { MenuElipsisVerticalIcon } from "@navikt/aksel-icons";
import { Button, Popover, VStack } from "@navikt/ds-react";
import { useRef, useState } from "react";
import "./more-menu.scss";
import { MediaInfo } from "utils/types/response-types";

export const MoreMenu = ({
  mediaInfo,
  handleDeleteFile,
  fileType,
}: {
  mediaInfo: MediaInfo;
  handleDeleteFile: (uri: string) => void;
  fileType: "image" | "document";
}) => {
  const buttonRef = useRef<SVGSVGElement>(null);
  const [openPopover, setOpenPopover] = useState(false);
  return (
    <>
      <MenuElipsisVerticalIcon
        className="more-menu__button"
        title="meny"
        aria-expanded={openPopover}
        ref={buttonRef}
        onClick={() => setOpenPopover(!openPopover)}
        fontSize="1.5rem"
      />
      <Popover
        className="more-menu__popover"
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
            <Button
              className="more-menu__inside-button"
              size="xsmall"
              variant="tertiary"
              onClick={() => handleDeleteFile(mediaInfo.uri)}
            >
              Slett
            </Button>
          </VStack>
        </Popover.Content>
      </Popover>
    </>
  );
};
