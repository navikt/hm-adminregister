import styles from "news/News.module.scss";
import { Box, Button, Dropdown } from "@navikt/ds-react";
import { MenuElipsisVerticalIcon } from "@navikt/aksel-icons";
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
        navigate(`/nyheter/rediger/${props.news.id}`, { state: props.news });
      }}
    >
      Rediger nyhetsmelding
    </Dropdown.Menu.GroupedList.Item>
  );

  const unpublishOption = (
    <>
      <Dropdown.Menu.GroupedList.Item
        onClick={() => {
          unpublishNews(props.news.id).then(() => props.mutateNewsRelease());
        }}
      >
        Avpubliser
      </Dropdown.Menu.GroupedList.Item>
    </>
  );

  const publishOption = (
    <>
      <Dropdown.Menu.GroupedList.Item
        onClick={() => {
          publishNews(props.news.id).then(() => props.mutateNewsRelease());
        }}
      >
        Publiser
      </Dropdown.Menu.GroupedList.Item>
    </>
  );

  const deleteOption = (
    <>
      <Dropdown.Menu.Divider />
      <Dropdown.Menu.GroupedList.Item
        onClick={() => {
          deleteNews(props.news.id).then(() => props.mutateNewsRelease());
        }}
      >
        Slett
      </Dropdown.Menu.GroupedList.Item>
    </>
  );

  function checkStatusAndPlaceOption(frontendStatus: NewsTypes) {
    if (frontendStatus === NewsTypes.PUBLISHED) {
      return (
        <>
          <Dropdown.Menu.Divider /> {unpublishOption}
        </>
      );
    } else if (frontendStatus === NewsTypes.FUTURE) {
      return (
        <>
          <Dropdown.Menu.Divider /> {publishOption}
        </>
      );
    }
  }

  return (
    <Box className={styles.optionButton}>
      <Dropdown>
        <Button
          variant="tertiary"
          icon={<MenuElipsisVerticalIcon title="Rediger" fontSize="1.5rem" />}
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
