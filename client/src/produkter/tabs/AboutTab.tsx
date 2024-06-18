import { Heading, Tabs, VStack } from "@navikt/ds-react";
import React, { useRef } from "react";
import { SubmitHandler, useFormContext } from "react-hook-form";
import { EditSeriesInfo } from "../Produkt";
import { IsoCategoryDTO, SeriesRegistrationDTO } from "utils/types/response-types";
import AboutTabDescription from "produkter/tabs/AboutTabDescription";
import AboutTabURL from "produkter/tabs/AboutTabURL";
import AboutTabKeywords from "produkter/tabs/AboutTabKeywords";

interface Props {
  series: SeriesRegistrationDTO;
  onSubmit: SubmitHandler<EditSeriesInfo>;
  updateSeriesInfo: (editSeriesInfo: EditSeriesInfo) => void;
  isoCategory?: IsoCategoryDTO;
  isEditable: boolean;
  showInputError: boolean;
}

const AboutTab = ({ series, updateSeriesInfo, isoCategory, isEditable, showInputError, onSubmit }: Props) => {
  const formMethods = useFormContext<EditSeriesInfo>();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Tabs.Panel value="about" className="tab-panel">
      <form method="POST" onSubmit={formMethods.handleSubmit(onSubmit)} ref={formRef}>
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
      </form>
    </Tabs.Panel>
  );
};

export default AboutTab;
