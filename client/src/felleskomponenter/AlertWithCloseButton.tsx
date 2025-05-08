import { Alert, AlertProps } from "@navikt/ds-react";
import React, { useEffect, useState } from "react";

export const AlertWithCloseButton = ({
  children = "Content",
  variant,
  alertId,
}: {
  children?: React.ReactNode;
  variant: AlertProps["variant"];
  alertId: string;
}) => {
  const alertName = `hasReadAlert-${alertId}`;
  const [hasReadAlert, setHasReadAlert] = useState(localStorage.getItem(alertName) === "true");

  useEffect(() => {
    localStorage.setItem(alertName, String(hasReadAlert));
  }, [hasReadAlert]);

  return !hasReadAlert ? (
    <Alert
      size={"medium"}
      variant={variant}
      closeButton
      onClose={() => setHasReadAlert(true)}
      style={{ width: "fit-content" }}
    >
      {children}
    </Alert>
  ) : null;
};
