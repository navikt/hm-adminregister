import { Alert, BodyShort, Box, Button, ExpansionCard, Heading, HStack, Loader, VStack } from "@navikt/ds-react";
import { Link } from "react-router-dom";
import { useCountSeriesToApprove, usePartsMissingHmsArtNr } from "utils/swr-hooks";
import { useState, useEffect } from "react";
import { hidePart, fetchHiddenParts, unhidePart } from "api/PartApi";
import ConfirmModal from "felleskomponenter/ConfirmModal";
import { HiddenPart } from "utils/types/response-types";

const StatPanel = ({
  title,
  value,
  loading,
  helpText,
  warning,
  children,
}: {
  title: string;
  value: number | undefined;
  loading: boolean;
  helpText?: string;
  warning?: string;
  children?: React.ReactNode;
}) => (
  <Box padding="8" width="100%" background="bg-default">
    <VStack gap="2">
      <Heading size="small" level="2">
        {title}
      </Heading>
      {loading ? (
        <Loader size="small" />
      ) : (
        <Heading size="xlarge" level="3" style={{ lineHeight: 1 }}>
          {value ?? "-"}
        </Heading>
      )}
      {helpText && <BodyShort size="small">{helpText}</BodyShort>}
      {warning && (
        <BodyShort size="small" style={{ color: "var(--a-text-danger)" }}>
          {warning}
        </BodyShort>
      )}
      {children}
    </VStack>
  </Box>
);

const AdminDashboard = () => {
  const { count: approveCount, isLoading: approveLoading, error: approveError } = useCountSeriesToApprove();
  const {
    count: partsWithoutHmsNr,
    isLoading: partsLoading,
    error: partsError,
    data: partsData,
    mutate: mutatePartsData,
  } = usePartsMissingHmsArtNr();
  const [hidingIds, setHidingIds] = useState<string[]>([]);
  const [hideError, setHideError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partIdToHide, setPartIdToHide] = useState<string | null>(null);

  // Hidden parts state
  const [showHidden, setShowHidden] = useState(false);
  const [hiddenParts, setHiddenParts] = useState<HiddenPart[]>([]);
  const [loadingHidden, setLoadingHidden] = useState(false);
  const [hiddenError, setHiddenError] = useState<string | null>(null);
  const [unhidingIds, setUnhidingIds] = useState<string[]>([]);

  // Map HiddenPart -> PartRow (id, articleName, supplierRef, supplierName)
  const hiddenPartRows = hiddenParts.map((hp) => ({
    id: hp.productId,
    articleName: hp.product?.articleName,
    supplierRef: hp.product?.supplierRef,
    // supplierName may not exist on ProductRegistrationDTOV2; leave undefined if not available
    supplierName: (hp as any).product?.supplierName,
  }));

  const loadHiddenParts = async () => {
    setLoadingHidden(true);
    setHiddenError(null);
    try {
      const data = await fetchHiddenParts();
      setHiddenParts(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Kunne ikke hente skjulte deler";
      setHiddenError(msg);
    } finally {
      setLoadingHidden(false);
    }
  };

  // Lazy load when toggled on
  useEffect(() => {
    if (showHidden) {
      loadHiddenParts();
    }
  }, [showHidden]);

  const handleHidePart = async (id: string) => {
    setHidingIds((prev) => [...prev, id]);
    setHideError(null);

    hidePart(id)
      .then(() => {
        mutatePartsData();
        loadHiddenParts();
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : "Ukjent feil ved skjuling av del";
        setHideError(msg);
      })
      .finally(() => {
        setHidingIds((prev) => prev.filter((hid) => hid !== id));
      });
  };

  const handleUnhidePart = async (id: string) => {
    setUnhidingIds((prev) => [...prev, id]);
    setHiddenError(null);
    try {
      await unhidePart(id);
      await loadHiddenParts();
      mutatePartsData();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Ukjent feil ved visning av del";
      setHiddenError(msg);
    } finally {
      setUnhidingIds((prev) => prev.filter((hid) => hid !== id));
    }
  };

  // Small presentational table component for reuse
  // Reusable lightweight row shape to avoid any casts
  interface PartRow {
    id: string;
    articleName?: string;
    supplierRef?: string;
    supplierName?: string;
  }

  const PartTable = ({
    parts,
    showHideAction,
    actionLabel,
    actionVariant,
    loadingIds,
    onAction,
    emptyText,
  }: {
    parts: PartRow[];
    showHideAction?: boolean;
    actionLabel?: string;
    actionVariant?: "danger" | "primary" | "secondary";
    loadingIds?: string[];
    onAction?: (id: string) => void;
    emptyText: string;
  }) => {
    if (!parts.length) return <BodyShort size="small">{emptyText}</BodyShort>;
    return (
      <Box as="table" width="100%" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "0.5rem" }}>Navn</th>
            <th style={{ textAlign: "left", padding: "0.5rem" }}>Levart. nr</th>
            {showHideAction && <th style={{ textAlign: "left", padding: "0.5rem" }} />}
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => (
            <tr key={part.id}>
              <td style={{ padding: "0.5rem" }}>
                <Link to={`/del/${part.id}`}>{part.articleName || `Del ${part.id}`}</Link>
              </td>
              <td style={{ padding: "0.5rem" }}>{part.supplierRef || "-"}</td>
              {showHideAction && (
                <td style={{ padding: "0.5rem" }}>
                  <Button
                    size="xsmall"
                    variant={actionVariant}
                    loading={loadingIds?.includes(part.id)}
                    onClick={() => onAction && onAction(part.id)}
                  >
                    {actionLabel}
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Box>
    );
  };

  return (
    <>
      <ConfirmModal
        title="Er du sikker på at du vil skjule delen fra listen?"
        confirmButtonText="Skjul"
        onClick={() => {
          if (partIdToHide) {
            handleHidePart(partIdToHide);
            setPartIdToHide(null);
            setIsModalOpen(false);
          }
        }}
        onClose={() => {
          setIsModalOpen(false);
        }}
        isModalOpen={isModalOpen}
      />
      <main className="show-menu">
        <VStack gap="8" style={{ maxWidth: "75rem" }}>
          <Heading level="1" size="large" spacing>
            Admin dashboard
          </Heading>
          {(approveError || partsError) && (
            <Alert variant="error">Kunne ikke hente alle tall. Last siden på nytt eller prøv senere.</Alert>
          )}
          <HStack gap="6" wrap>
            <StatPanel
              title="Produkter klare for godkjenning"
              value={approveCount}
              loading={approveLoading}
              helpText="Antall serier som venter på godkjenning."
            >
              <Box>
                <Button as={Link} to="/til-godkjenning" size="small" variant="secondary">
                  Gå til oversikt
                </Button>
              </Box>
            </StatPanel>
            <StatPanel
              title="Deler uten HMS-art.nr"
              value={partsWithoutHmsNr}
              loading={partsLoading}
              helpText="Registrerte deler fra leverandør uten HMS-artikkelnummer."
            >
              {hideError && <Alert variant="error">{hideError}</Alert>}

              {partsData && partsData.length > 0 && (
                <Box>
                  <Heading level="2" size="small" spacing>
                    Første 10 deler uten HMS-art.nr
                  </Heading>
                  <PartTable
                    parts={partsData.slice(0, 10)}
                    showHideAction
                    actionLabel="Skjul fra listen"
                    actionVariant="danger"
                    loadingIds={hidingIds}
                    onAction={(id) => {
                      setPartIdToHide(id);
                      setIsModalOpen(true);
                    }}
                    emptyText="Ingen deler"
                  />
                </Box>
              )}
              {partsData && partsData.length === 0 && !partsLoading && (
                <BodyShort size="small">Ingen deler uten HMS-art.nr</BodyShort>
              )}
              <ExpansionCard size="small" aria-label="Deler som er skjult fra denne listen" onToggle={setShowHidden} style={{marginTop: "40px"}}>
                <ExpansionCard.Header>
                  <ExpansionCard.Title size="small">Deler som er skjult fra denne listen</ExpansionCard.Title>
                </ExpansionCard.Header>
                <ExpansionCard.Content>
                  <Box style={{ marginBottom: "1rem" }} aria-busy={loadingHidden}>
                    {hiddenError && <Alert variant="error">{hiddenError}</Alert>}
                    {loadingHidden ? (
                      <Loader size="small" />
                    ) : (
                      <PartTable
                        parts={hiddenPartRows}
                        showHideAction
                        actionLabel="Vis i listen"
                        actionVariant="primary"
                        loadingIds={unhidingIds}
                        onAction={(id) => handleUnhidePart(id)}
                        emptyText="Ingen skjulte deler"
                      />
                    )}
                  </Box>
                </ExpansionCard.Content>
              </ExpansionCard>
            </StatPanel>
          </HStack>
        </VStack>
      </main>
    </>
  );
};

export default AdminDashboard;
