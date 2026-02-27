import { Alert, BodyShort, Box, Heading, Loader, VStack } from "@navikt/ds-react";
import type { ReactNode } from "react";

export interface StatPanelProps {
  title: string;
  value: number | undefined;
  loading: boolean;
  helpText?: string;
  warning?: string;
  children?: ReactNode;
}

export const StatPanel = ({ title, value, loading, helpText, warning, children }: StatPanelProps) => (
  <Box padding="space-16">
    <VStack gap="space-8">
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

export default StatPanel;

