import { Heading, Tabs, VStack } from "@navikt/ds-react";
import { IsoCategoryDTO, SeriesRegistrationDTO, SeriesRegistrationDTOV2 } from "utils/types/response-types";
import AboutTabDescription from "products/about/AboutTabDescription";
import AboutTabURL from "products/about/AboutTabURL";
import AboutTabKeywords from "products/about/AboutTabKeywords";

interface Props {
  series: SeriesRegistrationDTOV2;
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
        <VStack gap="2">
          <Heading level="2" size="small">
            Iso-kategori (kode)
          </Heading>

          <div>
            {isoCategory?.isoTitle} ({isoCategory?.isoCode})
          </div>
        </VStack>

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
