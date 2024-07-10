import styles from "news/News.module.scss";
import { Box, Button, Dropdown } from "@navikt/ds-react";
import { MenuElipsisVerticalIcon } from "@navikt/aksel-icons";
import { deleteNews, updateNews } from "api/NewsApi";
import React from "react";
import { NewsChunk, NewsRegistrationDTO } from "utils/types/response-types";
import { useNavigate } from "react-router-dom";
import { KeyedMutator } from "swr";
import { NewsTypes } from "news/NewsTypes";
import { toDateTimeString } from "utils/date-util";

type dropdownItems = {
  news: NewsRegistrationDTO;
  mutateNewsRelease: KeyedMutator<NewsChunk>;
  frontendStatus: NewsTypes;
};

export default function NewsDropdownMenu(props: dropdownItems) {
  const navigate = useNavigate();

  const publishNewsRelease: NewsRegistrationDTO = {
    id: props.news.id,
    title: props.news.title,
    text: props.news.text,
    published: toDateTimeString(new Date()),
    expired: props.news.expired,
    // UNDER ARE VALS IGNORED BY BACKEND
    status: "ACTIVE",
    draftStatus: "DONE",
    created: "a",
    updated: "a",
    author: "a",
    createdBy: "a",
    updatedBy: "a",
    createdByUser: "a",
    updatedByUser: "a",
  };
  const lastWeek = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);

  const unpublishNewsRelease: NewsRegistrationDTO = {
    id: props.news.id,
    title: props.news.title,
    text: props.news.text,
    published: toDateTimeString(lastWeek),
    expired: toDateTimeString(lastWeek),
    // UNDER ARE VALS IGNORED BY BACKEND
    status: "ACTIVE",
    draftStatus: "DONE",
    created: "a",
    updated: "a",
    author: "a",
    createdBy: "a",
    updatedBy: "a",
    createdByUser: "a",
    updatedByUser: "a",
  };

  const editOption = (
    <Dropdown.Menu.GroupedList.Item
      key={props.news.id}
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
        key={props.news.id}
        onClick={() => {
          updateNews(unpublishNewsRelease).then(() => props.mutateNewsRelease());
        }}
      >
        Avpubliser
      </Dropdown.Menu.GroupedList.Item>
    </>
  );

  const publishOption = (
    <>
      <Dropdown.Menu.GroupedList.Item
        key={props.news.id}
        onClick={() => {
          updateNews(publishNewsRelease).then(() => props.mutateNewsRelease());
        }}
      >
        Publiser
      </Dropdown.Menu.GroupedList.Item>
    </>
  );

  const deleteOption = (
    <>
      <Dropdown.Menu.Divider key={props.news.id + 1} />
      <Dropdown.Menu.GroupedList.Item
        key={props.news.id}
        onClick={() => {
          deleteNews(props.news.id).then(() => props.mutateNewsRelease());
        }}
      >
        Slett (GJØR INGENTING)
      </Dropdown.Menu.GroupedList.Item>
    </>
  );

  function checkStatusAndPlaceOption(frontendStatus: NewsTypes) {
    if (frontendStatus === NewsTypes.PUBLISHED) {
      return [<Dropdown.Menu.Divider key={props.news.id} />, unpublishOption];
    } else if (frontendStatus === NewsTypes.FUTURE) {
      return [
        <Dropdown.Menu.Divider key={props.news.id} />,
        publishOption,
        <Dropdown.Menu.Divider key={props.news.id} />,
        unpublishOption,
      ];
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
        <Dropdown.Menu key={props.news.id}>
          <Dropdown.Menu.GroupedList key={props.news.id}>
            {editOption}
            {checkStatusAndPlaceOption(props.frontendStatus)}
            {deleteOption}
          </Dropdown.Menu.GroupedList>
        </Dropdown.Menu>
      </Dropdown>
    </Box>
  );
}
