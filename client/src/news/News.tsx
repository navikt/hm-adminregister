import {
  Alert, Box,
  Button, Checkbox, Dropdown,
  ExpansionCard,
  Heading,
  HGrid,
  HStack,
  Loader,
  Pagination,
  Select,
  VStack
} from "@navikt/ds-react";
import {MenuElipsisVerticalIcon, PlusIcon} from "@navikt/aksel-icons";
import {useNavigate, useSearchParams} from "react-router-dom";
import {deleteNews, useFilteredNews} from "api/NewsApi";
import parse from "html-react-parser";
import styles from "./News.module.scss"
import React, {useEffect, useState} from "react";


const News = () => {

  const formatDateFunc = (dateString : string) => {
    const date = new Date(dateString)
    return (date.toLocaleDateString("no-NO",{dateStyle:"long"} ))
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const [pageState, setPageState] = useState(Number(searchParams.get("page")) || 1);
  const [pageSizeState, setPageSizeState] = useState(Number(searchParams.get("size")) || 10);
  const [includeInactive, setIncludeInactive] = useState(false);



  const navigate = useNavigate();
  const handleCreateNewsRelease = () => {
    navigate("/nyheter/opprett");
  };

  const {
    data: filteredResults,
    isLoading: isLoadingFilteredResults,
    error: errorResults,
    mutate: mutateNewsRealse
  } = useFilteredNews({
    page: pageState -1,
    pageSize: pageSizeState,
    includeInactive: includeInactive });

  useEffect(() => {
    if (filteredResults?.totalPages && filteredResults?.totalPages < pageState) {
      searchParams.set("page", String(filteredResults.totalPages));
      setSearchParams(searchParams);
      setPageState(filteredResults.totalPages);
    }
  }, [filteredResults]);


  const showPageNavigator = filteredResults && filteredResults.totalPages && filteredResults.totalPages > 1

  console.log(filteredResults)

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
                    onClick={handleCreateNewsRelease}
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
              <Button className={styles.createNewsButton}
                      variant="secondary"
                      size="medium"
                      icon={<PlusIcon aria-hidden/>}
                      iconPosition="left"
                      onClick={handleCreateNewsRelease}
              >
                Opprett ny nyhetsmelding
              </Button>

              <Checkbox onChange={() => {
                setIncludeInactive(!includeInactive);
              }}>
                Vis utgåtte
              </Checkbox>

            </HStack>
          </div>
          {isLoadingFilteredResults && <Loader size="3xlarge"/>}
          {filteredResults &&
              <div className="page__content-container">
                  <VStack className="products-page__producs" gap="4" paddingBlock="4">
                    {
                      filteredResults.content.map((news) => (

                          <ExpansionCard aria-label="Demo med description" key={news.id}>
                            <ExpansionCard.Header>
                              <ExpansionCard.Title>{news.title}</ExpansionCard.Title>
                              <ExpansionCard.Description>
                                                <span>
                                                    Synlig på FinnHjelpemiddel fra {formatDateFunc(news.published)} til {formatDateFunc(news.expired)}
                                                </span>
                              </ExpansionCard.Description>
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
                                    ></Button>
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
                                              deleteNews(news.id).then(() => {mutateNewsRealse()})
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
                          </ExpansionCard>
                      ))}
                  </VStack>
              </div>
          }

          <HStack gap="8" wrap={false} align='end'>
            {showPageNavigator === true && filteredResults && (
                <Pagination
                    page={pageState}
                    onPageChange={(x) => {
                      searchParams.set("page", x.toString());
                      setSearchParams(searchParams);
                      setPageState(x);
                    }}
                    count={filteredResults.totalPages!}
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