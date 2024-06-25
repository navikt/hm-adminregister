import {Button, ExpansionCard, Heading, VStack} from "@navikt/ds-react";
import {PlusIcon} from "@navikt/aksel-icons";
import { useNavigate } from "react-router-dom";
import {usePagedNews} from "api/NewsApi";
import parse from "html-react-parser";
import styles from "./News.module.scss"


const News = () => {
    const navigate = useNavigate();
    const handleCreateNewNews = () => {
        navigate("/nyheter/opprett");
    };

  const {
    data: pagedData,
    isLoading: isLoadingPagedData,
    error: errorPaged,
  } = usePagedNews({
    page: 1,
    pageSize: 10,
  });

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


                <VStack className="products-page__producs" gap="4">
                    {
                        pagedData?.content.map((news ) => (

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

            </div>
        </main>
    )
}

export default News