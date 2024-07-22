import { ClockDashedIcon, EyeClosedIcon, EyeIcon, PencilWritingIcon, XMarkOctagonIcon } from "@navikt/aksel-icons";
import TagWithIcon, { colors } from "../felleskomponenter/TagWithIcon";
import { SeriesStatus } from "utils/types/types";

const SeriesStatusTag = ({ seriesStatus }: { seriesStatus: SeriesStatus }) => {
  if (seriesStatus === SeriesStatus.DELETED) {
    return <TagWithIcon icon={<EyeClosedIcon aria-hidden fontSize={"1.5rem"} />} text="Slettet" color={colors.RED} />;
  } else if (seriesStatus === SeriesStatus.INACTIVE) {
    return <TagWithIcon icon={<EyeClosedIcon aria-hidden fontSize={"1.5rem"} />} text="Utgått" color={colors.RED} />;
  } else if (seriesStatus === SeriesStatus.REJECTED) {
    return (
      <TagWithIcon icon={<XMarkOctagonIcon aria-hidden fontSize={"1.5rem"} />} text="Avslått" color={colors.RED} />
    );
  } else if (seriesStatus === SeriesStatus.DRAFT) {
    return (
      <TagWithIcon icon={<EyeClosedIcon aria-hidden fontSize={"1.5rem"} />} text="Ikke publisert" color={colors.GREY} />
    );
  } else if (seriesStatus === SeriesStatus.PENDING) {
    return (
      <TagWithIcon
        icon={<ClockDashedIcon aria-hidden fontSize={"1.5rem"} />}
        text="Venter på godkjenning"
        color={colors.ORANGE}
      />
    );
  } else if (seriesStatus === SeriesStatus.PUBLISHED) {
    return <TagWithIcon icon={<EyeIcon aria-hidden fontSize={"1.5rem"} />} text="Publisert" color={colors.GREEN} />;
  } else if (seriesStatus === SeriesStatus.DRAFT_CHANGE) {
    return (
      <TagWithIcon icon={<PencilWritingIcon aria-hidden fontSize={"1.5rem"} />} text="Redigeres" color={colors.BLUE} />
    );
  } else {
    return <></>;
  }
};

export default SeriesStatusTag;
