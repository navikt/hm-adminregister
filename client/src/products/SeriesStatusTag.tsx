import { ClockDashedIcon, EyeClosedIcon, EyeIcon, PencilWritingIcon, XMarkOctagonIcon } from "@navikt/aksel-icons";
import { SeriesStatus } from "utils/types/types";
import TagWithIcon, { colors } from "../felleskomponenter/TagWithIcon";

const SeriesStatusTag = ({ seriesStatus, iconOnly = false }: { seriesStatus: SeriesStatus; iconOnly?: boolean }) => {
  if (seriesStatus === SeriesStatus.DELETED) {
    return (
      <TagWithIcon
        icon={<EyeClosedIcon aria-hidden fontSize={"1.5rem"} />}
        text={iconOnly ? "" : "Slettet"}
        color={colors.RED}
      />
    );
  } else if (seriesStatus === SeriesStatus.INACTIVE) {
    return (
      <TagWithIcon
        icon={<EyeClosedIcon aria-hidden fontSize={"1.5rem"} />}
        text={iconOnly ? "" : "Utgått"}
        color={colors.RED}
      />
    );
  } else if (seriesStatus === SeriesStatus.REJECTED) {
    return (
      <TagWithIcon
        icon={<XMarkOctagonIcon aria-hidden fontSize={"1.5rem"} />}
        text={iconOnly ? "" : "Avvist"}
        color={colors.RED}
      />
    );
  } else if (seriesStatus === SeriesStatus.DRAFT) {
    return (
      <TagWithIcon
        icon={<EyeClosedIcon aria-hidden fontSize={"1.5rem"} />}
        text={iconOnly ? "" : "Ikke publisert"}
        color={colors.GREY}
      />
    );
  } else if (seriesStatus === SeriesStatus.PENDING) {
    return (
      <TagWithIcon
        icon={<ClockDashedIcon aria-hidden fontSize={"1.5rem"} />}
        text={iconOnly ? "" : "Venter på godkjenning"}
        color={colors.ORANGE}
      />
    );
  } else if (seriesStatus === SeriesStatus.PUBLISHED) {
    return (
      <TagWithIcon
        icon={<EyeIcon aria-hidden fontSize={"1.5rem"} />}
        text={iconOnly ? "" : "Publisert"}
        color={colors.GREEN}
      />
    );
  } else if (seriesStatus === SeriesStatus.DRAFT_CHANGE) {
    return (
      <TagWithIcon
        icon={<PencilWritingIcon aria-hidden fontSize={"1.5rem"} />}
        text={iconOnly ? "" : "Redigeres"}
        color={colors.BLUE}
      />
    );
  } else {
    return <></>;
  }
};

export default SeriesStatusTag;
