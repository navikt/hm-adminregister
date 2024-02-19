import styled from "styled-components";
import { Tabs } from "@navikt/ds-react";

export const TabPanel = styled(Tabs.Panel)`
  padding: var(--a-spacing-4) 0;

  form {
    #description {
      height: 300px !important;
    }
  }
`;
