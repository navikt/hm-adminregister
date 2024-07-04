import {
  Alert,
  Button,
  Heading,
  HGrid,
  HStack,
  Loader,
  Pagination,
  Select, ToggleGroup,
  VStack
} from "@navikt/ds-react";
import { PlusIcon} from "@navikt/aksel-icons";
import {useNavigate, useSearchParams} from "react-router-dom";
import { getPageNews} from "api/NewsApi";
import styles from "./News.module.scss"
import React, {useEffect, useState} from "react";
import {toDate} from "utils/date-util";
import {NewsRegistrationDTO} from "utils/types/response-types";
import NewsCard from "news/newsCard";

const News = () => {

  const [searchParams, setSearchParams] = useSearchParams();
  const [pageState, setPageState] = useState(Number(searchParams.get("page")) || 1);
  const [pageSizeState, setPageSizeState] = useState(Number(searchParams.get("size")) || 5);
  const [newsStatus, setNewsStatus] = useState("ACTIVE");

  const navigate = useNavigate();

  function handleFilterOption(element: any) {
    if (newsStatus == "ALL") {
      return true
    } else if (newsStatus == "FUTURE" && element.status == "INACTIVE" && (toDate(element.published) > new Date())) {
      return true
    } else if (newsStatus == "EXPIRED" && element.status == "INACTIVE" && (toDate(element.published) < new Date())) {
      return true
    }
    return (newsStatus == element.status)
  }

  const {
    data: pageResults,
    isLoading: isLoadingFilteredResults,
    error: errorResults,
    mutate: mutateNewsRealse
  } = getPageNews({
    page: pageState -1,
    pageSize: pageSizeState
  });

  useEffect(() => {
    if (pageResults?.totalPages && pageResults?.totalPages < pageState) {
      searchParams.set("page", String(pageResults.totalPages));
      setSearchParams(searchParams);
      setPageState(pageResults.totalPages);
    }
  }, [pageResults]);


  const showPageNavigator = pageResults && pageResults.totalPages && pageResults.totalPages > 1

  if (errorResults) {
    return (
        <main className="show-menu">
          <div className="page__background-container">
            <Heading level="1" size="large" spacing>
              Nyheter
            </Heading>

            <Button className={styles.createNewsButton}
                    variant="secondary"
                    size="medium"
                    icon={<PlusIcon aria-hidden/>}
                    iconPosition="left"
                    onClick={() => navigate("/nyheter/opprett")}
            >
              Opprett ny nyhetsmelding
            </Button>

            <HGrid gap="12" columns="minmax(16rem, 55rem)" paddingBlock="4">
              <Alert variant="error">
                Kunne ikke vise nyheter. Prøv å laste siden på nytt. Hvis problemet vedvarer, kan du sende
                oss en e-post{" "}
                <a href="mailto:digitalisering.av.hjelpemidler.og.tilrettelegging@nav.no">
                  digitalisering.av.hjelpemidler.og.tilrettelegging@nav.no
                </a>
              </Alert>
            </HGrid>
          </div>
        </main>
    );
  }
  return (
      <main className="show-menu">
        <div className="page__background-container">
          <Heading level="1" size="large" spacing>
            Nyheter
          </Heading>
          <div className="page__content-container">
            <HStack justify="space-between"
                    gap="4">

              <ToggleGroup
                  value={newsStatus}
                  onChange={(value) => setNewsStatus(value)}
                  size="small"
                  defaultChecked={true}
              >
                <ToggleGroup.Item value={"ALL"}>Alle</ToggleGroup.Item>
                <ToggleGroup.Item value={"FUTURE"}>Fremtidige</ToggleGroup.Item>
                <ToggleGroup.Item value={"ACTIVE"} defaultChecked >Aktive</ToggleGroup.Item>
                <ToggleGroup.Item value={"EXPIRED"}>Utgåtte</ToggleGroup.Item>
              </ToggleGroup>

              <Button className={styles.createNewsButton}
                      variant="secondary"
                      size="medium"
                      icon={<PlusIcon aria-hidden/>}
                      iconPosition="left"
                      onClick={() => navigate("/nyheter/opprett")}
              >
                Opprett ny nyhetsmelding
              </Button>
            </HStack>
          </div>
          {isLoadingFilteredResults && <Loader size="3xlarge"/>}
          {pageResults &&
              <div className="page__content-container">
                  <VStack className="products-page__producs" gap="4" paddingBlock="4">
                    {
                      pageResults.content
                          .filter(handleFilterOption)
                          .map((news : NewsRegistrationDTO) =>
                          <NewsCard news={news} mutateNewsRealse={mutateNewsRealse} key={news.id}/>)
                    }
                  </VStack>
              </div>
          }

          <HStack gap="8" wrap={false} align='end'>
            {showPageNavigator && pageResults && (
                <Pagination
                    page={pageState}
                    onPageChange={(x) => {
                      searchParams.set("page", x.toString());
                      setSearchParams(searchParams);
                      setPageState(x);
                    }}
                    count={pageResults.totalPages!}
                    size="small"
                    prevNextTexts
                />
            )}
            <Select
                className={styles.pageSize}
                label="Antall nyhter per side"
                size="small"
                defaultValue={pageSizeState}
                onChange={(e) => {
                  searchParams.set("size", e.target.value);
                  setSearchParams(searchParams);
                  setPageSizeState(parseInt(e.target.value));
                }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={100}>100</option>
            </Select>
          </HStack>
        </div>
      </main>
  )
}

export default News