import { QuestionmarkIcon } from "@navikt/aksel-icons";
import TagWithIcon, { colors } from "./TagWithIcon";
import UniformTag from "felleskomponenter/UniformTag";

interface StatusProps {
  countDrafts: number;
  countPublished: number;
  countPending: number;
  countDeclined: number;
}

export const StatusTagProductList = ({ countDrafts, countPublished, countPending, countDeclined }: StatusProps) => {
  if (countDeclined > 0) {
    return <UniformTag text="Avslått" color={colors.RED} />;
  } else if (countDrafts > 0) {
    return <UniformTag text="Utkast" color={colors.GREY} />;
  } else if (countPublished > 0) {
    return <UniformTag text="Publisert" color={colors.GREEN} />;
  } else if (countPending > 0) {
    return <UniformTag text="Venter på godkjenning" color={colors.ORANGE} />;
  } else {
    return <UniformTag text={"Utgått"} color={colors.GREY} />;
  }
};
