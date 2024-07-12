import { Heading, Tabs, VStack } from "@navikt/ds-react";
import { EditSeriesInfo } from "../Produkt";
import { IsoCategoryDTO, SeriesRegistrationDTO } from "utils/types/response-types";
import AboutTabDescription from "produkter/tabs/AboutTabDescription";
import AboutTabURL from "produkter/tabs/AboutTabURL";
import AboutTabKeywords from "produkter/tabs/AboutTabKeywords";

interface Props {
  series: SeriesRegistrationDTO;
  updateSeriesInfo: (editSeriesInfo: EditSeriesInfo) => void;
  isoCategory?: IsoCategoryDTO;
  isEditable: boolean;
  showInputError: boolean;
}

const AboutTab = ({ series, updateSeriesInfo, isoCategory, isEditable, showInputError }: Props) => {

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
            description={series.text}
            updateSeriesInfo={updateSeriesInfo}
            showInputError={showInputError}
            isEditable={isEditable}
          />

          <AboutTabKeywords
            keywords={series.seriesData.attributes.keywords ? series.seriesData.attributes.keywords : []}
            updateSeriesInfo={updateSeriesInfo}
            showInputError={showInputError}
            isEditable={isEditable}
          />

          <AboutTabURL
            url={series.seriesData.attributes.url ? series.seriesData.attributes.url : ""}
            updateSeriesInfo={updateSeriesInfo}
            showInputError={showInputError}
            isEditable={isEditable}
          />
        </VStack>
    </Tabs.Panel>
  );
};

export default AboutTab;
