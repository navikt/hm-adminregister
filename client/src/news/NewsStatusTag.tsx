import { EyeClosedIcon, EyeIcon, HourglassTopFilledIcon } from "@navikt/aksel-icons";
import LocalTag, { colors } from "felleskomponenter/LocalTag";
import { NewsTypes } from "news/NewsTypes";

const NewsStatusTag = ({ newsStatus }: { newsStatus: NewsTypes }) => {
  switch (newsStatus) {
    case NewsTypes.FUTURE:
      return (
        <LocalTag
          icon={<HourglassTopFilledIcon aria-hidden fontSize="1.5rem" />}
          text="Fremtidig"
          color={colors.ORANGE}
        />
      );
    case NewsTypes.PUBLISHED:
      return <LocalTag icon={<EyeIcon aria-hidden fontSize={"1.5rem"} />} text="Publisert" color={colors.GREEN} />;
    case NewsTypes.UNPUBLISHED:
      return (
        <LocalTag icon={<EyeClosedIcon aria-hidden fontSize={"1.5rem"} />} text="Avpublisert" color={colors.RED} />
      );
    default:
      return <></>;
  }
};

export default NewsStatusTag;
