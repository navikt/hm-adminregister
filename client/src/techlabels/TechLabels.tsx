import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {
    Box,
    Button,
    Heading,
    HStack,
    Loader,
    Pagination,
    Search,
    BodyShort,
    Tooltip,
    Alert
} from "@navikt/ds-react";
import {PlusIcon, PencilWritingIcon} from "@navikt/aksel-icons";
import {getTechLabels} from "api/TechLabelApi";
import {TechLabelRegistrationDTO} from "utils/types/response-types";
import styles from "./TechLabels.module.scss";

const PAGE_SIZE = 20;
const MAX_VISIBLE_OPTIONS = 10;

const TechLabels = () => {
    const [techLabels, setTechLabels] = useState<TechLabelRegistrationDTO[]>([]);
    const [filteredLabels, setFilteredLabels] = useState<TechLabelRegistrationDTO[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchIsoCode, setSearchIsoCode] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        setError(null);
        getTechLabels({}, 0, 5000)
            .then((res) => {
                setTechLabels(res.content);
                setFilteredLabels(res.content);
            })
            .catch(() => setError("Failed to fetch tech labels"))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const filtered = techLabels.filter(label =>
            (label.label?.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (label.isoCode?.toLowerCase().includes(searchIsoCode.toLowerCase()))
        );
        setFilteredLabels(filtered);
        setPage(1);
    }, [searchTerm, searchIsoCode, techLabels]);

    const paginatedLabels = filteredLabels.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <main className="show-menu">
            <div className="page__background-container">
                <Heading level="1" size="large" spacing>
                    Teknisk-data beskrivelser
                </Heading>
                <div className={styles.techLabelsContainer}>
                    <HStack justify="space-between" wrap gap="4" marginBlock="8 0">
                        <Box role="search" className="search-box">
                            <Search
                                label="Søk etter Label"
                                variant="simple"
                                placeholder="Søk etter Label"
                                size="medium"
                                value={searchTerm}
                                onChange={setSearchTerm}
                            />
                        </Box>
                        <Box role="search" className="search-box">
                            <Search
                                label="Søk etter IsoCode"
                                variant="simple"
                                placeholder="Søk etter IsoCode"
                                size="medium"
                                value={searchIsoCode}
                                onChange={setSearchIsoCode}
                            />
                        </Box>
                        <Button
                            variant="secondary"
                            size="medium"
                            icon={<PlusIcon aria-hidden/>}
                            iconPosition="left"
                            onClick={() => navigate("/tekniskdata/opprett")}
                        >
                            Opprett ny teknisk-data beskrivelse
                        </Button>
                    </HStack>
                    <div className="panel-list__container">
                        {loading && <Loader size="3xlarge" title="venter..."/>}
                        {!loading && filteredLabels.length === 0 && (
                            <Alert variant="info">Ingen tekniskdata funnet.</Alert>
                        )}
                        {!loading && filteredLabels.length > 0 && (
                            <div className={styles.cardRow + " " + styles.cardHeader}>
                                <BodyShort
                                    className={`${styles.cardValue} ${styles.mediumColumn}`}><strong>Label</strong></BodyShort>
                                <BodyShort
                                    className={`${styles.cardValue} ${styles.mediumColumn}`}><strong>IsoCode</strong></BodyShort>
                                <BodyShort className={`${styles.cardValue} ${styles.shortColumn}`}><strong>Type</strong></BodyShort>
                                <BodyShort className={`${styles.cardValue} ${styles.shortColumn}`}><strong>Unit</strong></BodyShort>
                                <BodyShort
                                    className={`${styles.cardValue} ${styles.optionsColumn}`}><strong>Options</strong></BodyShort>
                                <span className={styles.editButtonHeader}></span>
                            </div>
                        )}
                        {paginatedLabels.map((label) => (
                            <Box key={label.id} className={styles.cardBox}>
                                <div className={styles.cardRow}>
                                    <BodyShort
                                        className={`${styles.cardValue} ${styles.mediumColumn}`}>{label.label}</BodyShort>
                                    <BodyShort
                                        className={`${styles.cardValue} ${styles.mediumColumn}`}>{label.isoCode}</BodyShort>
                                    <BodyShort
                                        className={`${styles.cardValue} ${styles.shortColumn}`}>{label.type}</BodyShort>
                                    <BodyShort
                                        className={`${styles.cardValue} ${styles.shortColumn}`}>{label.unit}</BodyShort>
                                    <BodyShort className={`${styles.cardValue} ${styles.optionsColumn}`}>
                                        {label.options && label.options.length > 0 ? (
                                            label.options.length > MAX_VISIBLE_OPTIONS ? (
                                                <Tooltip content={label.options.join(", ")}>
              <span>
                {label.options.slice(0, MAX_VISIBLE_OPTIONS).join(", ")}, ... ({label.options.length})
              </span>
                                                </Tooltip>
                                            ) : (
                                                label.options.join(", ")
                                            )
                                        ) : (
                                            "-"
                                        )}
                                    </BodyShort>
                                    <span className={styles.editButton}>
        <Button
            size="xsmall"
            variant="tertiary"
            icon={<PencilWritingIcon aria-hidden/>}
            onClick={() => navigate(`/tekniskdata/rediger/${label.id}`, {state: label})}
            aria-label="Rediger"
        />
      </span>
                                </div>
                            </Box>
                        ))}
                        {filteredLabels.length > PAGE_SIZE && (
                            <Pagination
                                page={page}
                                onPageChange={setPage}
                                count={Math.ceil(filteredLabels.length / PAGE_SIZE)}
                                boundaryCount={1}
                                siblingCount={0}
                                size="small"
                            />
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default TechLabels;