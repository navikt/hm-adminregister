import { ClockDashedIcon, EyeClosedIcon, EyeIcon, XMarkOctagonIcon } from "@navikt/aksel-icons";
import TagWithIcon, { colors } from "./TagWithIcon";
import { SeriesStatus } from "utils/types/types";

const StatusTag = ({ seriesStatus }: { seriesStatus: SeriesStatus }) => {
  if (seriesStatus === SeriesStatus.DELETED) {
    return <TagWithIcon icon={<EyeClosedIcon aria-hidden fontSize={"1.5rem"} />} text="Slettet" color={colors.RED} />;
  } else if (seriesStatus === SeriesStatus.INACTIVE) {
    return <TagWithIcon icon={<EyeClosedIcon aria-hidden fontSize={"1.5rem"} />} text="Inaktiv" color={colors.RED} />;
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
  } else {
    return <></>;
  }
};

export default StatusTag;
