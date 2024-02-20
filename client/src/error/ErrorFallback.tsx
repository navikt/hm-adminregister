import React from "react";
import type { FallbackProps } from "react-error-boundary";
import { Error500Page } from "./Error500Page";
import { Error401Page } from "./Error401Page";

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  if (error.status === 500) {
    return <Error500Page error={error} resetErrorBoundary={resetErrorBoundary} />;
  } else if (error.status === 401) {
    return <Error401Page error={error} resetErrorBoundary={resetErrorBoundary} />;
  }

  return <Error500Page error={error} resetErrorBoundary={resetErrorBoundary} />;
};
