import { NewsTypes } from "news/NewsTypes";
import TagWithIcon, { colors } from "felleskomponenter/TagWithIcon";
import { EyeClosedIcon, EyeIcon, HourglassTopFilledIcon } from "@navikt/aksel-icons";

const NewsStatusTag = ({ newsStatus }: { newsStatus: NewsTypes }) => {
  switch (newsStatus) {
    case NewsTypes.FUTURE:
      return (
        <TagWithIcon
          icon={<HourglassTopFilledIcon aria-hidden fontSize="1.5rem" />}
          text="Fremtidig"
          color={colors.ORANGE}
        />
      );
    case NewsTypes.PUBLISHED:
      return <TagWithIcon icon={<EyeIcon aria-hidden fontSize={"1.5rem"} />} text="Publisert" color={colors.GREEN} />;
    case NewsTypes.UNPUBLISHED:
      return (
        <TagWithIcon icon={<EyeClosedIcon aria-hidden fontSize={"1.5rem"} />} text="Avpublisert" color={colors.RED} />
      );
    default:
      return <></>;
  }
};

export default NewsStatusTag;
