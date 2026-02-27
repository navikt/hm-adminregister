import {BodyShort, Heading, HStack, VStack, Box, Loader, Button} from "@navikt/ds-react";
import {usePagedParts} from "api/PartApi";
import {usePagedProducts} from "utils/swr-hooks";
import {Link} from "react-router-dom";
import {SkyraSurveyBox} from "skyra/SkyraSurveyBox";
import styles from "./VendorDashboard.module.scss";
import {ArrowsCirclepathIcon} from "@navikt/aksel-icons";

const VendorDashboard = () => {
    const {data: productsToApproveData, mutate: mutateProductsToApprove} = usePagedProducts({
        page: 0,
        pageSize: 1,
        titleSearchTerm: "",
        filters: ["Venter på godkjenning"],
    });

    const productsToApproveCount = productsToApproveData?.totalSize ?? 0;

    const {data: rejectedProductsData, mutate: mutateRejectedProducts} = usePagedProducts({
        page: 0,
        pageSize: 1,
        titleSearchTerm: "",
        filters: ["Avslått"],
    });

    const rejectedProductsCount = rejectedProductsData?.totalSize ?? 0;

    const {data: mainProductsOnAgreementData, mutate: mutateMainProductsOnAgreement} = usePagedProducts({
        page: 0,
        pageSize: 1,
        titleSearchTerm: "",
        filters: [],
        agreementFilter: "true",
        missingMediaType: "IMAGE",
    });

    const {data: mainProductsNotOnAgreementData, mutate: mutateMainProductsNotOnAgreement} = usePagedProducts({
        page: 0,
        pageSize: 1,
        titleSearchTerm: "",
        filters: [],
        agreementFilter: "false",
        missingMediaType: "IMAGE",
    });

    const mainProductsOnAgreementCount = mainProductsOnAgreementData?.totalSize ?? 0;
    const mainProductsNotOnAgreementCount = mainProductsNotOnAgreementData?.totalSize ?? 0;

    const {data: partsOnAgreementData, mutate: mutatePartsOnAgreement} = usePagedParts({
        page: 0,
        pageSize: 1,
        titleSearchTerm: "",
        agreementFilter: "true",
        missingMediaType: "IMAGE",
        isAccessory: true
    });

    const {data: partsNotOnAgreementData, mutate: mutatePartsNotOnAgreement} = usePagedParts({
        page: 0,
        pageSize: 1,
        titleSearchTerm: "",
        agreementFilter: "false",
        missingMediaType: "IMAGE",
        isAccessory: true
    });

    const partsOnAgreementCount = partsOnAgreementData?.totalSize ?? 0;
    const partsNotOnAgreementCount = partsNotOnAgreementData?.totalSize ?? 0;

    const {data: mainProductsWithoutVideoOnAgreementData, mutate: mutateMainProductsVideoOnAgreement} = usePagedProducts({
        page: 0,
        pageSize: 1,
        titleSearchTerm: "",
        filters: [],
        agreementFilter: "true",
        missingMediaType: "VIDEO",
    });

    const {data: mainProductsWithoutVideoNotOnAgreementData, mutate: mutateMainProductsVideoNotOnAgreement} = usePagedProducts({
        page: 0,
        pageSize: 1,
        titleSearchTerm: "",
        filters: [],
        agreementFilter: "false",
        missingMediaType: "VIDEO",
    });

    const mainProductsWithoutVideoOnAgreementCount = mainProductsWithoutVideoOnAgreementData?.totalSize ?? 0;
    const mainProductsWithoutVideoNotOnAgreementCount = mainProductsWithoutVideoNotOnAgreementData?.totalSize ?? 0;

    const isLoading = !mainProductsOnAgreementData || !mainProductsNotOnAgreementData;

    const refreshDashboard = () => {
        mutateProductsToApprove();
        mutateRejectedProducts();
        mutateMainProductsOnAgreement();
        mutateMainProductsNotOnAgreement();
        mutatePartsOnAgreement();
        mutatePartsNotOnAgreement();
        mutateMainProductsVideoOnAgreement();
        mutateMainProductsVideoNotOnAgreement();
    };

    return (
        <>
            <main className="show-menu">
                <VStack gap="space-4" style={{maxWidth: "75rem"}}>
                    <HStack gap="space-6" align="start" justify="space-between">
                        <VStack gap="space-2">
                            <Heading level="1" size="large">
                                Dashboard
                            </Heading>
                            <Button
                                variant="secondary"
                                size="small"
                                icon={<ArrowsCirclepathIcon aria-hidden/>}
                                onClick={refreshDashboard}
                            >
                                Oppdater
                            </Button>
                        </VStack>
                        <SkyraSurveyBox
                            buttonText={'Gi tilbakemelding!'}
                            skyraSlug={'arbeids-og-velferdsetaten-nav/digihot-lev-dashboard'}/>
                    </HStack>
                    <Heading level="2" size="medium" style={{marginTop: "2rem"}}>
                        Produkter til godkjenning
                    </Heading>
                    <HStack gap="space-6" wrap>
                        <Box
                            padding="space-6"
                            borderRadius="8"
                        background="raised"
                        className={styles.box}
                        >
                        <Heading level="3" size="small">
                            Venter på godkjenning
                        </Heading>
                        {isLoading ? (
                            <Loader size="medium"/>
                        ) : productsToApproveCount > 0 ? (
                            <Link to="/produkter?filters=Venter på godkjenning">
                                <Heading level="3" size="large" spacing>
                                    {productsToApproveCount}
                                </Heading>
                            </Link>
                        ) : (
                            <Heading level="3" size="large" spacing>
                                {productsToApproveCount}
                            </Heading>
                        )}
                        <BodyShort size="small">
                            Antall produkter som venter på godkjenning fra HMS-bruker.
                        </BodyShort>
                    </Box>

                    <Box
                        padding="space-6"
                        borderRadius="8"
                    background="raised"
                    className={styles.box}
                    >
                    <Heading level="3" size="small">
                        Avslåtte
                    </Heading>
                    {isLoading ? (
                        <Loader size="medium"/>
                    ) : rejectedProductsCount > 0 ? (
                        <Link to="/produkter?filters=Avslått">
                            <Heading level="3" size="large" spacing>
                                {rejectedProductsCount}
                            </Heading>
                        </Link>
                    ) : (
                        <Heading level="3" size="large" spacing>
                            {rejectedProductsCount}
                        </Heading>
                    )}
                    <BodyShort size="small">
                        Antall produkter som er avslått av HMS-bruker.
                    </BodyShort>
                </Box>
            </HStack>
            <Heading level="2" size="medium" style={{marginTop: "2rem"}}>
                Produkter uten bilde
            </Heading><HStack gap="space-6" wrap>
            <Box
                padding="space-6"
                borderRadius="8"
            background="raised"
            className={styles.box}
            >
            <Heading level="3" size="small">
                På rammeavtale
            </Heading>
            {isLoading ? (
                <Loader size="medium"/>
            ) : mainProductsOnAgreementCount > 0 ? (
                <Link to="/produkter?missingMediaType=IMAGE&inAgreement=true">
                    <Heading level="3" size="large" spacing>
                        {mainProductsOnAgreementCount}
                    </Heading>
                </Link>
            ) : (
                <Heading level="3" size="large" spacing>
                    {mainProductsOnAgreementCount}
                </Heading>
            )}
            <BodyShort size="small">
                Antall produkter som er på en rammeavtale og mangler bilde.
            </BodyShort>
        </Box><Box
            padding="space-6"
            borderRadius="8"
                        background="raised"
                        className={styles.box}
                    >
                        <Heading level="3" size="small">
                            Ikke på rammeavtale
                        </Heading>
                        {isLoading ? (
                            <Loader size="medium"/>
                        ) : mainProductsNotOnAgreementCount > 0 ? (
                            <Link to="/produkter?missingMediaType=IMAGE&inAgreement=false">
                                <Heading level="3" size="large" spacing>
                                    {mainProductsNotOnAgreementCount}
                                </Heading>
                            </Link>
                        ) : (
                            <Heading level="3" size="large" spacing>
                                {mainProductsNotOnAgreementCount}
                            </Heading>
                        )}
                        <BodyShort size="small">
                            Antall produkter som ikke er på rammeavtale og mangler bilde.
                        </BodyShort>
                    </Box>
                </HStack>

                <Heading level="2" size="medium" style={{marginTop: "2rem"}}>
                    Produkter uten video
                </Heading>
                <HStack gap="space-6" wrap>
                    <Box
                        padding="space-6"
                        borderRadius="8"
                        background="raised"
                        className={styles.box}
                    >
                        <Heading level="3" size="small">
                            På rammeavtale
                        </Heading>
                        {isLoading ? (
                            <Loader size="medium"/>
                        ) : mainProductsWithoutVideoOnAgreementCount > 0 ? (
                            <Link to="/produkter?missingMediaType=VIDEO&inAgreement=true">
                                <Heading level="3" size="large" spacing>
                                    {mainProductsWithoutVideoOnAgreementCount}
                                </Heading>
                            </Link>
                        ) : (
                            <Heading level="3" size="large" spacing>
                                {mainProductsWithoutVideoOnAgreementCount}
                            </Heading>
                        )}
                        <BodyShort size="small">
                            Antall produkter som er på en rammeavtale og mangler video.
                        </BodyShort>
                    </Box>

                    <Box
                        padding="space-6"
                        borderRadius="8"
                        background="raised"
                        className={styles.box}
                    >
                        <Heading level="3" size="small">
                            Ikke på rammeavtale
                        </Heading>
                        {isLoading ? (
                            <Loader size="medium"/>
                        ) : mainProductsWithoutVideoNotOnAgreementCount > 0 ? (
                            <Link to="/produkter?missingMediaType=VIDEO&inAgreement=false">
                                <Heading level="3" size="large" spacing>
                                    {mainProductsWithoutVideoNotOnAgreementCount}
                                </Heading>
                            </Link>
                        ) : (
                            <Heading level="3" size="large" spacing>
                                {mainProductsWithoutVideoNotOnAgreementCount}
                            </Heading>
                        )}
                        <BodyShort size="small">
                            Antall produkter som ikke er på rammeavtale og mangler video.
                        </BodyShort>
                    </Box>
                </HStack>

                <Heading level="2" size="medium" style={{marginTop: "2rem"}}>
                    Tilbehør uten bilde
                </Heading>
                <HStack gap="space-6" wrap>
                    <Box
                        padding="space-6"
                        borderRadius="8"
                        background="raised"
                        className={styles.box}
                    >
                        <Heading level="3" size="small">
                            På rammeavtale
                        </Heading>
                        {isLoading ? (
                            <Loader size="medium"/>
                        ) : partsOnAgreementCount > 0 ? (
                            <Link to="/deler?missingMediaType=IMAGE&inAgreement=true&isAccessory=true">
                                <Heading level="3" size="large" spacing>
                                    {partsOnAgreementCount}
                                </Heading>
                            </Link>
                        ) : (
                            <Heading level="3" size="large" spacing>
                                {partsOnAgreementCount}
                            </Heading>
                        )}
                        <BodyShort size="small">
                            Antall tilbehør som er på en rammeavtale og mangler bilde.
                        </BodyShort>
                    </Box>

                    <Box
                        padding="space-6"
                        borderRadius="8"
                        background="raised"
                        className={styles.box}
                    >
                        <Heading level="3" size="small">
                            Ikke på rammeavtale
                        </Heading>
                        {isLoading ? (
                            <Loader size="medium"/>
                        ) : partsNotOnAgreementCount > 0 ? (
                            <Link to="/deler?missingMediaType=IMAGE&inAgreement=false&isAccessory=true">
                                <Heading level="3" size="large" spacing>
                                    {partsNotOnAgreementCount}
                                </Heading>
                            </Link>
                        ) : (
                            <Heading level="3" size="large" spacing>
                                {partsNotOnAgreementCount}
                            </Heading>
                        )}
                        <BodyShort size="small">
                            Antall tilbehør som ikke er på rammeavtale og mangler bilde.
                        </BodyShort>
                    </Box>

                </HStack>
            </VStack>
        </main>
        </>
    );
};

export default VendorDashboard;
