import { Alert, BodyShort, Box, Button, Heading, HStack, Loader, VStack } from "@navikt/ds-react";
import { Link } from "react-router-dom";
import { useCountSeriesToApprove, usePartsMissingHmsArtNr } from "utils/swr-hooks";
import { ProductRegistrationDTOV2 } from "utils/types/response-types";
import { useState } from "react";
import { hidePartById } from "api/PartApi";
import ConfirmModal from "felleskomponenter/ConfirmModal";

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
  <Box padding="8" background="bg-default" width="100%">
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

  const handleHidePart = async (id: string) => {
    setHidingIds((prev) => [...prev, id]);
    setHideError(null);

    hidePartById(id)
      .then(() => {
        mutatePartsData();
      })
      .catch((e: any) => {
        setHideError(e.message || "Ukjent feil ved skjuling av del");
      })
      .finally(() => {
        setHidingIds((prev) => prev.filter((hid) => hid !== id));
      });
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
                  <Box as="table" width="100%" style={{ borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "0.5rem" }}>Navn</th>
                        <th style={{ textAlign: "left", padding: "0.5rem" }}>Levart. nr</th>
                        <th style={{ textAlign: "left", padding: "0.5rem" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {partsData.slice(0, 10).map((part: ProductRegistrationDTOV2) => (
                        <tr key={part.id}>
                          <td style={{ padding: "0.5rem" }}>
                            <Link to={`/del/${part.id}`}>{part.articleName || `Del ${part.id}`}</Link>
                          </td>
                          <td style={{ padding: "0.5rem" }}>{part.supplierRef || "-"}</td>
                          <td style={{ padding: "0.5rem" }}>
                            <Button
                              size="xsmall"
                              variant="danger"
                              loading={hidingIds.includes(part.id)}
                              onClick={() => {
                                setPartIdToHide(part.id);
                                setIsModalOpen(true);
                              }}
                            >
                              Skjul fra listen
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                </Box>
              )}
            </StatPanel>
          </HStack>
        </VStack>
      </main>
    </>
  );
};

export default AdminDashboard;
