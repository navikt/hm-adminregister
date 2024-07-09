import { Box, Button, Dropdown, ExpansionCard } from "@navikt/ds-react";
import styles from "news/News.module.scss";
import parse from "html-react-parser";
import { MenuElipsisVerticalIcon } from "@navikt/aksel-icons";
import { depublishNews } from "api/NewsApi";
import React from "react";
import { NewsRegistrationDTO } from "utils/types/response-types";
import { toReadableString } from "utils/date-util";
import { useNavigate } from "react-router-dom";
import { KeyedMutator } from "swr";
import { NewsChunk } from "utils/types/response-types";
import NewsStatusTag from "news/NewsStatusTag";
import { mapBackendStatusToFrontend } from "news/News";
import DropdownMenu from "news/DropdownMenu";

export default function NewsCard({
  news,
  mutateNewsRelease,
}: {
  news: NewsRegistrationDTO;
  mutateNewsRelease: KeyedMutator<NewsChunk>;
}) {
  const frontendStatus = mapBackendStatusToFrontend(news);
  return (
    <ExpansionCard aria-label={"Nyhetskort for " + news.title}>
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
          <DropdownMenu
            news={news}
            mutateNewsRelease={mutateNewsRelease}
            frontendStatus={frontendStatus}
            key={news.id}
          />
        </div>
      </ExpansionCard.Content>
    </ExpansionCard>
  );
}
