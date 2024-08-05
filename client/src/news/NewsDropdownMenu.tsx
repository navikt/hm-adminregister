import styles from "news/News.module.scss";
import { Box, Button, Dropdown } from "@navikt/ds-react";
import { EyeClosedIcon, EyeIcon, MenuElipsisHorizontalCircleIcon, PencilWritingIcon, TrashIcon } from "@navikt/aksel-icons";
import { deleteNews, publishNews, unpublishNews } from "api/NewsApi";
import { NewsChunk, NewsRegistrationDTO } from "utils/types/response-types";
import { useNavigate } from "react-router-dom";
import { KeyedMutator } from "swr";
import { NewsTypes } from "news/NewsTypes";

type dropdownItems = {
  news: NewsRegistrationDTO;
  mutateNewsRelease: KeyedMutator<NewsChunk>;
  frontendStatus: NewsTypes;
};

export default function NewsDropdownMenu(props: dropdownItems) {
  const navigate = useNavigate();

  const editOption = (
    <Dropdown.Menu.GroupedList.Item
      onClick={() => {
        navigate(`/nyheter/rediger`, { state: props.news });
      }}
    >
      Rediger
      <PencilWritingIcon title="Rediger" fontSize="1.5rem" />
    </Dropdown.Menu.GroupedList.Item>
  );

  const unpublishOption = (
    <Dropdown.Menu.GroupedList.Item
      onClick={() => {
        unpublishNews(props.news.id).then(() => props.mutateNewsRelease());
      }}
    >
      Avpubliser
      <EyeClosedIcon title="Avpubliser" fontSize="1.5rem" />
    </Dropdown.Menu.GroupedList.Item>
  );

  const publishOption = (
    <Dropdown.Menu.GroupedList.Item
      onClick={() => {
        publishNews(props.news.id).then(() => props.mutateNewsRelease());
      }}
    >
      Publiser
      <EyeIcon title="Publiser" fontSize="1.5rem" />
    </Dropdown.Menu.GroupedList.Item>
  );

  const deleteOption = (
    <>
      <Dropdown.Menu.Divider />
      <Dropdown.Menu.GroupedList.Item
        style={{ color: "RED" }}
        onClick={() => {
          deleteNews(props.news.id).then(() => props.mutateNewsRelease());
        }}
      >
        Slett
        <TrashIcon title="Slett" fontSize="1.5rem" color="RED" />
      </Dropdown.Menu.GroupedList.Item>
    </>
  );

  function checkStatusAndPlaceOption(frontendStatus: NewsTypes) {
    if (frontendStatus === NewsTypes.PUBLISHED) {
      return (
        <>
          {unpublishOption}
        </>
      );
    } else if (frontendStatus === NewsTypes.FUTURE) {
      return (
        <>
          {publishOption}
        </>
      );
    }
  }

  return (
    <Box className={styles.optionButton}>
      <Dropdown>
        <Button
          variant="tertiary"
          icon={<MenuElipsisHorizontalCircleIcon title="Rediger" fontSize="1.5rem" />}
          as={Dropdown.Toggle}
        />
        <Dropdown.Menu>
          <Dropdown.Menu.GroupedList>
            {editOption}
            {checkStatusAndPlaceOption(props.frontendStatus)}
            {deleteOption}
          </Dropdown.Menu.GroupedList>
        </Dropdown.Menu>
      </Dropdown>
    </Box>
  );
}
