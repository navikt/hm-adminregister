import { colors } from "./TagWithIcon";
import UniformTag from "felleskomponenter/UniformTag";

interface StatusProps {
  isDraft: boolean;
  isPublished: boolean;
  isPending: boolean;
  isRejected: boolean;
}

export const StatusTagProductList = ({ isDraft, isPublished, isPending, isRejected }: StatusProps) => {
  if (isRejected) {
    return <UniformTag text="Avslått" color={colors.RED} />;
  } else if (isDraft ) {
    return <UniformTag text="Utkast" color={colors.GREY} />;
  } else if (isPublished) {
    return <UniformTag text="Publisert" color={colors.GREEN} />;
  } else if (isPending) {
    return <UniformTag text="Venter på godkjenning" color={colors.ORANGE} />;
  } else {
    return <UniformTag text={"Utgått"} color={colors.GREY} />;
  }
};
