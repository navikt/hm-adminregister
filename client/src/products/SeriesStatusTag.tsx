import { ClockDashedIcon, EyeClosedIcon, EyeIcon, PencilWritingIcon, XMarkOctagonIcon } from "@navikt/aksel-icons";
import { SeriesStatus } from "utils/types/types";
import LocalTag, { colors } from "../felleskomponenter/LocalTag";

const SeriesStatusTag = ({ seriesStatus, iconOnly = false }: { seriesStatus: SeriesStatus; iconOnly?: boolean }) => {
  if (seriesStatus === SeriesStatus.DELETED) {
    return (
      <LocalTag
        icon={<EyeClosedIcon aria-hidden={!iconOnly} title="Status slettet" fontSize={"1.5rem"} />}
        text={iconOnly ? "" : "Slettet"}
        color={colors.RED}
      />
    );
  } else if (seriesStatus === SeriesStatus.INACTIVE) {
    return (
      <LocalTag
        icon={<EyeClosedIcon aria-hidden={!iconOnly} title="Status slettet" fontSize={"1.5rem"} />}
        text={iconOnly ? "" : "Utgått"}
        color={colors.RED}
      />
    );
  } else if (seriesStatus === SeriesStatus.REJECTED) {
    return (
      <LocalTag
        icon={<XMarkOctagonIcon aria-hidden={!iconOnly} title="Status avslått" fontSize={"1.5rem"} />}
        text={iconOnly ? "" : "Avslått"}
        color={colors.RED}
      />
    );
  } else if (seriesStatus === SeriesStatus.PENDING) {
    return (
      <LocalTag
        icon={<ClockDashedIcon aria-hidden={!iconOnly} title="Venter på godkjenning" fontSize={"1.5rem"} />}
        text={iconOnly ? "" : "Venter på godkjenning"}
        color={colors.ORANGE}
      />
    );
  } else if (seriesStatus === SeriesStatus.PUBLISHED) {
    return (
      <LocalTag
        icon={<EyeIcon aria-hidden={!iconOnly} title="Status publisert" fontSize={"1.5rem"} />}
        text={iconOnly ? "" : "Publisert"}
        color={colors.GREEN}
      />
    );
  } else if (seriesStatus === SeriesStatus.DRAFT_CHANGE || seriesStatus === SeriesStatus.DRAFT) {
    return (
      <LocalTag
        icon={<PencilWritingIcon aria-hidden={!iconOnly} title={iconOnly ? "Under endring" : ""} fontSize={"1.5rem"} />}
        text={iconOnly ? "" : "Under endring"}
        color={colors.BLUE}
      />
    );
  } else {
    return <></>;
  }
};

export default SeriesStatusTag;
