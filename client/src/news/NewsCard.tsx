import { Box, Button, Dropdown, ExpansionCard } from "@navikt/ds-react";
import styles from "news/News.module.scss";
import parse from "html-react-parser";
import { MenuElipsisVerticalIcon } from "@navikt/aksel-icons";
import { depublishNews } from "api/NewsApi";
import React from "react";
import { NewsRegistrationDTO } from "utils/types/response-types";
import { toDate, toReadableString } from "utils/date-util";
import { useNavigate } from "react-router-dom";
import { KeyedMutator } from "swr";
import { NewsChunk } from "utils/types/response-types";
import { NewsTypes } from "news/NewsTypes";
import NewsStatusTag from "news/NewsStatusTag";

export default function NewsCard({
  news,
  mutateNewsRelease,
}: {
  news: NewsRegistrationDTO;
  mutateNewsRelease: KeyedMutator<NewsChunk>;
}) {
  function mapBackendStatusToFrontend(news: NewsRegistrationDTO): NewsTypes {
    const today = new Date();
    const publishedOn = toDate(news.published);
    const expiredOn = toDate(news.expired);

    if (news.status === "ACTIVE" && publishedOn < today && expiredOn > today) {
      return NewsTypes.PUBLISHED;
    } else if (news.status === "INACTIVE" && publishedOn > today) {
      return NewsTypes.FUTURE;
    } else if ((news.status === "INACTIVE" && expiredOn < today) || news.status === "DELETED") {
      return NewsTypes.EXPIRED;
    }
    return NewsTypes.EXPIRED;
  }

  const frontendStatus = mapBackendStatusToFrontend(news);
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
        <NewsStatusTag newsStatus={frontendStatus} />
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
