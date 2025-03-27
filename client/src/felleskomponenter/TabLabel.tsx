import { ExclamationmarkTriangleIcon } from "@navikt/aksel-icons";
import styles from "./TabLabel.module.scss";

export const TabLabel = ({
  title,
  numberOfElements,
  showAlert,
  isValid,
}: {
  title: string;
  numberOfElements: number;
  showAlert: boolean;
  isValid: boolean;
}) => {
  return (
    <>
      {title}
      {numberOfElements === 0 && !isValid && showAlert ? (
        <span className={styles.tabLabel}>
          ({numberOfElements})<ExclamationmarkTriangleIcon />
        </span>
      ) : (
        <span>({numberOfElements})</span>
      )}
    </>
  );
};
