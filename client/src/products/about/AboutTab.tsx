import { Tabs, VStack } from "@navikt/ds-react";

import AboutTabDescription from "products/about/AboutTabDescription";
import AboutTabKeywords from "products/about/AboutTabKeywords";
import AboutTabURL from "products/about/AboutTabURL";
import { IsoCategoryDTO, SeriesRegistrationDTO } from "utils/types/response-types";

interface Props {
  series: SeriesRegistrationDTO;
  isAdmin: boolean;
  mutateSeries: () => void;
  isoCategory?: IsoCategoryDTO;
  isEditable: boolean;
  showInputError: boolean;
}

const AboutTab = ({ series, isAdmin, mutateSeries, isoCategory, isEditable, showInputError }: Props) => {
  return (
    <Tabs.Panel value="about" className="tab-panel">
      <VStack gap="14">
        <AboutTabDescription
          series={series}
          isAdmin={isAdmin}
          mutateSeries={mutateSeries}
          showInputError={showInputError}
          isEditable={isEditable}
        />

        <AboutTabKeywords series={series} isAdmin={isAdmin} mutateSeries={mutateSeries} isEditable={isEditable} />

        <AboutTabURL series={series} isAdmin={isAdmin} mutateSeries={mutateSeries} isEditable={isEditable} />
      </VStack>
    </Tabs.Panel>
  );
};

export default AboutTab;
