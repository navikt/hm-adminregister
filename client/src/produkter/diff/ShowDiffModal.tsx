import { DifferenceDTO, ProductRegistrationDTO, SeriesRegistrationDTO } from "utils/types/response-types";
import { BodyShort, Button, Modal } from "@navikt/ds-react";
import { useErrorStore } from "utils/store/useErrorStore";
import { useEffect, useState } from "react";
import {
  getDifferenceFromPublishedSeries,
  getDifferencesFromPublishedVariants,
  ProductDifferenceDTO,
} from "api/VersionApi";
import styles from "./ShowDiffModal.module.scss";
import { ErrorBoundary } from "react-error-boundary";
import { SeriesDiff } from "produkter/diff/SeriesDiff";
import { Avstand } from "felleskomponenter/Avstand";
import { VariantsDiff } from "produkter/diff/VariantsDiff";

export const ShowDiffModal = ({
  series,
  products,
  isOpen,
  setIsOpen,
}: {
  series: SeriesRegistrationDTO;
  products: ProductRegistrationDTO[];
  isOpen: boolean;
  setIsOpen: (newState: boolean) => void;
}) => {
  const { setGlobalError } = useErrorStore();
  const [seriesDifference, setSeriesDifference] = useState<null | DifferenceDTO>(null);
  const [variantsDifferences, setVariantsDifferences] = useState<ProductDifferenceDTO[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
    const fetchDifferences = async () => {
      const seriesDifferenceResult = await getDifferenceFromPublishedSeries(series.id, series.version ?? 0);
      setSeriesDifference(seriesDifferenceResult);

      const variantsDifferencesResult = await getDifferencesFromPublishedVariants(products);
      setVariantsDifferences(variantsDifferencesResult);
    };

    fetchDifferences()
      .then((r) => r)
      .catch((error) => {
        setGlobalError(error.status, error.message);
      });

    setIsLoading(false);
  }, []);

  if (isLoading) return <div>Laster...</div>;

  if (!seriesDifference || !variantsDifferences) return <div>Ingen endringer</div>;

  return (
    <Modal open={isOpen} header={{ heading: "" }} onClose={() => setIsOpen(false)} className={styles.diffModal}>
      <Modal.Body>
        <ErrorBoundary FallbackComponent={ErrorFallbackDiffModal}>
          {isLoading ? (
            <>Laster...</>
          ) : series.published && seriesDifference.status === "NEW" ? (
            <>Dette er et migrert produkt og det finnes ingen endringslogg per nå, vennligst sjekk produktet manuelt</>
          ) : (
            <>
              <SeriesDiff seriesDiff={seriesDifference!} />
              <Avstand marginTop={4} />
              <VariantsDiff variantDiffs={variantsDifferences} />
            </>
          )}
        </ErrorBoundary>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setIsOpen(false)}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const ErrorFallbackDiffModal = () => {
  return (
    <div>
      <BodyShort>Beklager, det skjedde en feil ved henting av endringer</BodyShort>
    </div>
  );
};
