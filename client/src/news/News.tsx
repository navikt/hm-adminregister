import {Alert, Button, ExpansionCard, Heading, HStack, Loader, Pagination, Select, VStack} from "@navikt/ds-react";
import {PlusIcon} from "@navikt/aksel-icons";
import React from "react";
import { useNavigate } from "react-router-dom";


const News = () => {
    const navigate = useNavigate();
    const handleCreateNewNews = () => {
        navigate("/nyheter/opprett");
    };

    const listeTom: string[] = ["EN", "TO", "TRE", "YP"]          // BYTT MED API DATA
    return (
        <main className="show-menu">
            <div className="page__background-container">
                <Heading level="1" size="large" spacing>
                    Nyheter
                </Heading>
                <Button
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
                        listeTom.map((val: string) =>

                            <ExpansionCard aria-label="Demo med description">
                                <ExpansionCard.Header>
                                    <ExpansionCard.Title>APITITTLE</ExpansionCard.Title>
                                    <ExpansionCard.Description>
                                        API TEKST
                                    </ExpansionCard.Description>
                                </ExpansionCard.Header>
                                <ExpansionCard.Content>
                                    {val}
                                </ExpansionCard.Content>
                            </ExpansionCard>
                        )}
                </VStack>

            </div>
        </main>
    )
}

export default News