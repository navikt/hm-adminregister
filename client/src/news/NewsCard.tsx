import { Box, Button, Dropdown, ExpansionCard } from "@navikt/ds-react";
import StatusTag from "felleskomponenter/StatusTag";
import styles from "news/News.module.scss";
import parse from "html-react-parser";
import { MenuElipsisVerticalIcon } from "@navikt/aksel-icons";
import { depublishNews } from "api/NewsApi";
import React from "react";
import { NewsRegistrationDTO } from "utils/types/response-types";
import { toDate, toReadableString } from "utils/date-util";
import { SeriesStatus } from "utils/types/types";
import { useNavigate } from "react-router-dom";
import { KeyedMutator } from "swr";
import { NewsChunk } from "utils/types/response-types";

export default function NewsCard({
  news,
  mutateNewsRelease,
  status,
}: {
  news: NewsRegistrationDTO;
  mutateNewsRelease: KeyedMutator<NewsChunk>;
  status: string;
}) {
  const newsReleaseStatus = (newsStatus: string) => {
    if (newsStatus === "ALL") {
      if (news.status === "INACTIVE" && toDate(news.published) > new Date()) {
        return SeriesStatus.DRAFT;
      } else if (news.status === "INACTIVE" && toDate(news.published) < new Date()) {
        return SeriesStatus.INACTIVE;
      } else if (news.status === "ACTIVE") {
        return SeriesStatus.PUBLISHED;
      } else {
        return SeriesStatus.INACTIVE;
      }
    }
    if (newsStatus === "FUTURE") {
      return SeriesStatus.DRAFT;
    }
    if (newsStatus === "ACTIVE") {
      return SeriesStatus.PUBLISHED;
    }
    if (newsStatus === "EXPIRED") {
      return SeriesStatus.INACTIVE;
    }
    return SeriesStatus.DRAFT_CHANGE;
  };

  const navigate = useNavigate();

  return (
    <ExpansionCard aria-label="Demo med description">
      <ExpansionCard.Header>
        <ExpansionCard.Title>{news.title}</ExpansionCard.Title>
        <ExpansionCard.Description>
          <span>
            Synlig på FinnHjelpemiddel fra {toReadableString(news.published)} til {toReadableString(news.expired)}
          </span>
        </ExpansionCard.Description>
        <StatusTag seriesStatus={newsReleaseStatus(status)} />
      </ExpansionCard.Header>
      <ExpansionCard.Content>
        <div className={styles.cardContainerDiv}>
          <span className={styles.seperatingLine}>{parse(news.text)}</span>
          <Box className={styles.optionButton}>
            <Dropdown>
              <Button
                variant="tertiary"
                icon={<MenuElipsisVerticalIcon title="Rediger" fontSize="1.5rem" />}
                as={Dropdown.Toggle}
              />
              <Dropdown.Menu>
                <Dropdown.Menu.GroupedList>
                  <Dropdown.Menu.GroupedList.Item
                    onClick={() => {
                      navigate(`/nyheter/rediger/${news.id}`, { state: news });
                    }}
                  >
                    Rediger nyhetsmelding
                  </Dropdown.Menu.GroupedList.Item>
                </Dropdown.Menu.GroupedList>
                <Dropdown.Menu.Divider />
                <Dropdown.Menu.List>
                  <Dropdown.Menu.List.Item
                    onClick={() => {
                      depublishNews(news.id).then(() => mutateNewsRelease());
                    }}
                  >
                    Gjør utgått
                  </Dropdown.Menu.List.Item>
                </Dropdown.Menu.List>
              </Dropdown.Menu>
            </Dropdown>
          </Box>
        </div>
      </ExpansionCard.Content>
    </ExpansionCard>
  );
}
