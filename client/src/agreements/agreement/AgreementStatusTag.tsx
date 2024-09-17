import { ClockDashedIcon, EyeClosedIcon, EyeIcon } from "@navikt/aksel-icons";
import { toDate, toReadableDateString } from "utils/date-util";
import LocalTag, { colors } from "../../felleskomponenter/LocalTag";

const AgreementStatusTag = ({ publiseringsdato, isDraft }: { publiseringsdato: string; isDraft: boolean }) => {
  if (isDraft) {
    return (
      <LocalTag
        icon={<EyeClosedIcon aria-hidden fontSize={"1.5rem"} />}
        text="Ikke publisert (kladd)"
        color={colors.GREY}
      />
    );
  } else if (toDate(publiseringsdato) > new Date()) {
    return (
      <LocalTag
        icon={<ClockDashedIcon aria-hidden fontSize={"1.5rem"} />}
        text={`Aktiv fra ${toReadableDateString(publiseringsdato)}`}
        color={colors.ORANGE}
      />
    );
  } else {
    return <LocalTag icon={<EyeIcon aria-hidden fontSize={"1.5rem"} />} text="Publisert" color={colors.GREEN} />;
  }
};

export default AgreementStatusTag;
