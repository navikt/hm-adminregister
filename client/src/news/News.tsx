import {
    Alert,
    Button,
    ExpansionCard,
    Heading,
    HGrid,
    HStack,
    Loader,
    Pagination,
    Select,
    VStack
} from "@navikt/ds-react";
import {PlusIcon} from "@navikt/aksel-icons";
import {useNavigate, useSearchParams} from "react-router-dom";
import {usePagedNews} from "api/NewsApi";
import parse from "html-react-parser";
import styles from "./News.module.scss"
import React, {useEffect, useState} from "react";


const News = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const [pageState, setPageState] = useState(Number(searchParams.get("page")) || 1);
    const [pageSizeState, setPageSizeState] = useState(Number(searchParams.get("size")) || 10);

    const navigate = useNavigate();
    const handleCreateNewNews = () => {
        navigate("/nyheter/opprett");
    };
  const {
    data: pagedData,
    isLoading: isLoadingPagedData,
    error: errorPaged,
  } = usePagedNews({
    page: pageState - 1,
    pageSize: pageSizeState,
  });

    useEffect(() => {
        if (pagedData?.totalPages && pagedData?.totalPages < pageState) {
            searchParams.set("page", String(pagedData.totalPages));
            setSearchParams(searchParams);
            setPageState(pagedData.totalPages);
        }
    }, [pagedData]);

    const showPageNavigator = pagedData && pagedData.totalPages && pagedData.totalPages > 1

    if (errorPaged) {
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
                            onClick={handleCreateNewNews}
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
                <Button className={styles.createNewsButton}
                    variant="secondary"
                    size="medium"
                    icon={<PlusIcon aria-hidden/>}
                    iconPosition="left"
                    onClick={handleCreateNewNews}
                >
                    Opprett ny nyhetsmelding
                </Button>

                { isLoadingPagedData && <Loader size="3xlarge" />}
                { pagedData &&
                <VStack className="products-page__producs" gap="4" paddingBlock="4">
                    {
                        pagedData.content.map((news ) => (

                            <ExpansionCard aria-label="Demo med description" key={news.id}>
                                <ExpansionCard.Header>
                                    <ExpansionCard.Title>{news.title}</ExpansionCard.Title>
                                    <ExpansionCard.Description>
                                        {news.title}
                                    </ExpansionCard.Description>
                                </ExpansionCard.Header>
                                <ExpansionCard.Content>
                                    {parse(news.text)}
                                </ExpansionCard.Content>
                            </ExpansionCard>
                        ))}
                </VStack>
                }

                <HStack gap="8" wrap={false}>
                    { showPageNavigator === true && pagedData && (
                    <Pagination
                        page={pageState}
                        onPageChange={(x) => {
                            searchParams.set("page", x.toString());
                            setSearchParams(searchParams);
                            setPageState(x);
                        }}
                        count={pagedData.totalPages!}
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