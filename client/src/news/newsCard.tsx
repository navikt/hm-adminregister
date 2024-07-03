import {Box, Button, Dropdown, ExpansionCard} from "@navikt/ds-react";
import StatusTag from "felleskomponenter/StatusTag";
import styles from "news/News.module.scss";
import parse from "html-react-parser";
import {MenuElipsisVerticalIcon} from "@navikt/aksel-icons";
import {deleteNews} from "api/NewsApi";
import React from "react";
import {NewsRegistrationDTO} from "utils/types/response-types";
import {toReadableString} from "utils/date-util";
import {SeriesStatus} from "utils/types/types";
import {useNavigate} from "react-router-dom";
import {KeyedMutator} from "swr";
import {NewsChunk} from "utils/types/response-types";


export default function NewsCard(
    {news, mutateNewsRealse, key}: {
      news: NewsRegistrationDTO,
      mutateNewsRealse: KeyedMutator<NewsChunk>,
      key: string
    }) {

  const newsRealseStatus = (newsStatus: "ACTIVE" | "INACTIVE" | "DELETED") => {
    return (newsStatus === "ACTIVE") ? (SeriesStatus.PUBLISHED) : (SeriesStatus.INACTIVE)
  }

  const navigate = useNavigate();

  return (<ExpansionCard aria-label="Demo med description" key={key}>
    <ExpansionCard.Header>
      <ExpansionCard.Title>
        {news.title}
      </ExpansionCard.Title>
      <ExpansionCard.Description>
                                <span>
                                    Synlig på FinnHjelpemiddel fra {toReadableString(news.published)} til {toReadableString(news.expired)}
                                </span>
      </ExpansionCard.Description>
      <StatusTag seriesStatus={newsRealseStatus(news.status)}/>
    </ExpansionCard.Header>
    <ExpansionCard.Content>
      <div className={styles.cardContainerDiv}>
                                <span className={styles.seperatingLine}>
                                    {parse(news.text)}
                                </span>
        <Box className={styles.optionButton}>
          <Dropdown>
            <Button
                variant="tertiary"
                icon={<MenuElipsisVerticalIcon title="Rediger"
                                               fontSize="1.5rem"/>}
                as={Dropdown.Toggle}
            />
            <Dropdown.Menu>
              <Dropdown.Menu.GroupedList>
                <Dropdown.Menu.GroupedList.Item
                    onClick={() => {
                      navigate(`/nyheter/rediger/${news.id}`, {state: news})
                    }}>
                  Rediger nyhetsmelding
                </Dropdown.Menu.GroupedList.Item>
              </Dropdown.Menu.GroupedList>
              <Dropdown.Menu.Divider/>
              <Dropdown.Menu.List>
                <Dropdown.Menu.List.Item
                    onClick={() => {
                      deleteNews(news.id).then(() => {
                        mutateNewsRealse
                      })
                    }}
                >
                  Slett nyhetsmelding
                </Dropdown.Menu.List.Item>
              </Dropdown.Menu.List>
            </Dropdown.Menu>
          </Dropdown>
        </Box>
      </div>
    </ExpansionCard.Content>
  </ExpansionCard>)
}