import styled from "styled-components";
import { Tabs } from "@navikt/ds-react";

export const TabPanel = styled(Tabs.Panel)`
  padding: var(--ax-space-16) 0;

  form {
    #description {
      height: 300px !important;
    }
  }
`;
