import { ClockDashedIcon, EyeClosedIcon, EyeIcon } from "@navikt/aksel-icons";
import TagWithIcon, { colors } from "./TagWithIcon";

const StatusTagAgreement = ({ publiseringsdato, isDraft }: { publiseringsdato: Date; isDraft: boolean }) => {
  if (isDraft) {
    return (
      <TagWithIcon
        icon={<EyeClosedIcon aria-hidden fontSize={"1.5rem"} />}
        text="Ikke publisert (kladd)"
        color={colors.GREY}
      />
    );
  } else if (publiseringsdato > new Date()) {
    return (
      <TagWithIcon
        icon={<ClockDashedIcon aria-hidden fontSize={"1.5rem"} />}
        text="Venter på godkjenning"
        color={colors.ORANGE}
      />
    );
  } else {
    return <TagWithIcon icon={<EyeIcon aria-hidden fontSize={"1.5rem"} />} text="Publisert" color={colors.GREEN} />;
  }
};

export default StatusTagAgreement;
