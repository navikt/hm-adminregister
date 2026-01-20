import { Tabs, VStack } from "@navikt/ds-react";

import AboutTabDescription from "products/about/AboutTabDescription";
import AboutTabKeywords from "products/about/AboutTabKeywords";
import AboutTabURL from "products/about/AboutTabURL";
import { SeriesDTO } from "utils/types/response-types";
import styles from "../ProductPage.module.scss";

interface Props {
  series: SeriesDTO;
  mutateSeries: () => void;
  isEditable: boolean;
  showInputError: boolean;
}

const AboutTab = ({ series, mutateSeries, isEditable, showInputError }: Props) => {
  return (
    <Tabs.Panel value="about" className={styles.tabPanel}>
      <VStack gap="14">
        <AboutTabDescription
          series={series}
          mutateSeries={mutateSeries}
          showInputError={showInputError}
          isEditable={isEditable}
        />

        <AboutTabKeywords series={series} mutateSeries={mutateSeries} isEditable={isEditable} />

        {/*<AboutTabURL series={series} mutateSeries={mutateSeries} isEditable={isEditable} />*/}
      </VStack>
    </Tabs.Panel>
  );
};

export default AboutTab;
