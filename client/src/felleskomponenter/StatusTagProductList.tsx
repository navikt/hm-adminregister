import { ClockDashedIcon, EyeClosedIcon, EyeIcon, QuestionmarkIcon, XMarkOctagonIcon } from "@navikt/aksel-icons";
import TagWithIcon, { colors } from "./TagWithIcon";
import { AdminStatus, DraftStatus, SeriesStatus } from "utils/types/response-types";

interface StatusProps {
  draftStatus: DraftStatus;
  adminStatus: AdminStatus;
  seriesStatus: SeriesStatus;
}

export const StatusTagProductList = ({ draftStatus, adminStatus, seriesStatus }: StatusProps) => {
  if (draftStatus === "DRAFT" && adminStatus === "REJECTED") {
    return (
      <TagWithIcon icon={<XMarkOctagonIcon aria-hidden fontSize={"1.5rem"} />} text="Avslått" color={colors.RED} />
    );
  } else if (draftStatus === "DRAFT") {
    return <TagWithIcon icon={<EyeClosedIcon aria-hidden fontSize={"1.5rem"} />} text="Utkast" color={colors.GREY} />;
  } else if (draftStatus === "DONE" && adminStatus === "APPROVED" && seriesStatus === "INACTIVE") {
    return <TagWithIcon icon={<EyeClosedIcon aria-hidden fontSize={"1.5rem"} />} text="Utgått" color={colors.RED} />;
  } else if (draftStatus === "DONE" && adminStatus === "APPROVED" && seriesStatus === "ACTIVE") {
    return <TagWithIcon icon={<EyeIcon aria-hidden fontSize={"1.5rem"} />} text="Publisert" color={colors.GREEN} />;
  } else if (draftStatus === "DONE" && adminStatus === "PENDING" && seriesStatus === "INACTIVE") {
    return (
      <TagWithIcon
        icon={<ClockDashedIcon aria-hidden fontSize={"1.5rem"} />}
        text="Venter på godkjenning"
        color={colors.ORANGE}
      />
    );
  } else if (draftStatus === "DONE" && seriesStatus === "DELETED") {
    return <TagWithIcon icon={<EyeClosedIcon aria-hidden fontSize={"1.5rem"} />} text="Slettet" color={colors.RED} />;
  } else {
    return (
      <TagWithIcon icon={<QuestionmarkIcon aria-hidden fontSize={"1.5rem"} />} text={"Ukjent"} color={colors.GREY} />
    );
  }
};
