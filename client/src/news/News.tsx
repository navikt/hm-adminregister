import { Alert, Box, Button, Heading, HGrid, HStack, Loader, ToggleGroup, VStack } from "@navikt/ds-react";
import { useNavigate } from "react-router-dom";
import { getPageNews } from "api/NewsApi";
import React, { useState } from "react";
import { toDate } from "utils/date-util";
import { NewsRegistrationDTO } from "utils/types/response-types";
import NewsCard from "news/NewsCard";
import { PlusIcon } from "@navikt/aksel-icons";
import { NewsTypes } from "news/NewsTypes";
import styles from "./News.module.scss";
import { TRUE } from "sass";

export function mapBackendStatusToFrontend(news: NewsRegistrationDTO): NewsTypes {
  const today = new Date();
  const publishedOn = toDate(news.published);
  const expiredOn = toDate(news.expired);

  if (news.status === "ACTIVE" && publishedOn < today && expiredOn > today) {
    return NewsTypes.PUBLISHED;
  } else if (news.status === "INACTIVE" && publishedOn > today) {
    return NewsTypes.FUTURE;
  } else if (news.status === "INACTIVE" && expiredOn < today) {
    return NewsTypes.UNPUBLISHED;
  }
  return NewsTypes.UNPUBLISHED;
}

const News = () => {
  const [newsStatus, setNewsStatus] = useState("ALL");
  const navigate = useNavigate();

  function handleFilterOption(news: NewsRegistrationDTO, filterStatus: string) {
    const frontendNewsStatus = mapBackendStatusToFrontend(news);

    if (
      filterStatus == "ALL" &&
      (frontendNewsStatus == NewsTypes.PUBLISHED || frontendNewsStatus == NewsTypes.FUTURE)
    ) {
      return true;
    } else if (filterStatus == "ALL") {
      return false;
    } else {
      return frontendNewsStatus == filterStatus;
    }
  }

  const {
    data: pageResults,
    isLoading: isLoadingFilteredResults,
    error: errorResults,
    mutate: mutateNewsRelease,
  } = getPageNews();

  return (
    <main className="show-menu">
      <div className="page__background-container">
        <Heading level="1" size="large" spacing>
          Nyheter
        </Heading>
        <div className="page__content-container">
          <HStack justify="space-between" gap="4">
            <ToggleGroup value={newsStatus} onChange={(value) => setNewsStatus(value)} size="small">
              <ToggleGroup.Item value={"ALL"}>Alle</ToggleGroup.Item>
              <ToggleGroup.Item value={NewsTypes.FUTURE}>Fremtidig</ToggleGroup.Item>
              <ToggleGroup.Item value={NewsTypes.PUBLISHED}>Publisert</ToggleGroup.Item>
              <ToggleGroup.Item value={NewsTypes.UNPUBLISHED}>Historikk</ToggleGroup.Item>
            </ToggleGroup>

            <Button
              className={styles.createNewsButton}
              variant="secondary"
              size="medium"
              icon={<PlusIcon aria-hidden />}
              iconPosition="left"
              onClick={() => navigate("/nyheter/opprett")}
            >
              Opprett ny nyhetsmelding
            </Button>
          </HStack>
        </div>
        {isLoadingFilteredResults && <Loader size="3xlarge" />}

        {errorResults ? (
          <HGrid gap="12" columns="minmax(16rem, 55rem)" paddingBlock="4">
            <Alert variant="error">
              Kunne ikke vise nyheter. Prøv å laste siden på nytt. Hvis problemet vedvarer, kan du sende oss en e-post{" "}
              <a href="mailto:digitalisering.av.hjelpemidler.og.tilrettelegging@nav.no">
                digitalisering.av.hjelpemidler.og.tilrettelegging@nav.no
              </a>
            </Alert>
          </HGrid>
        ) : (
          pageResults && (
            <Box maxWidth="55rem">
              <VStack className="products-page__producs" gap="4" paddingBlock="4">
                {pageResults.content
                  .filter((news: NewsRegistrationDTO) => handleFilterOption(news, newsStatus))
                  .map((news: NewsRegistrationDTO) => (
                    <NewsCard news={news} mutateNewsRelease={mutateNewsRelease} key={news.id} />
                  ))}
              </VStack>
            </Box>
          )
        )}
      </div>
    </main>
  );
};

export default News;
