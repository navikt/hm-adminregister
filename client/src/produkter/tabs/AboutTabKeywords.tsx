import { BodyShort, Button, Heading, HStack, Tag, UNSAFE_Combobox, VStack } from "@navikt/ds-react";
import { FloppydiskIcon, PencilWritingIcon, PlusCircleIcon } from "@navikt/aksel-icons";
import { useState } from "react";
import { isValidKeyword } from "produkter/seriesUtils";
import "./about-tab-keywords.scss";
import { SeriesRegistrationDTO } from "utils/types/response-types";
import { updateSeriesKeywords } from "api/SeriesApi";
import { useErrorStore } from "utils/store/useErrorStore";

interface Props {
  series: SeriesRegistrationDTO;
  isAdmin: boolean;
  mutateSeries: () => void;
  isEditable: boolean;
}

export const AboutTabKeywords = ({ series, isAdmin, mutateSeries, isEditable }: Props) => {
  const keywords = series.seriesData.attributes.keywords ? series.seriesData.attributes.keywords : [];
  const [showEditKeywordsMode, setShowEditKeywordsMode] = useState(false);
  const [keywordFormatError, setKeywordFormatError] = useState<string | undefined>(undefined);
  const [inputValue, setInputValue] = useState("");
  const [updatedKeywords, setUpdatedKeywords] = useState<string[]>(keywords ? keywords : []);

  const { setGlobalError } = useErrorStore();

  const validKeywordLetters = new RegExp(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9_\s]*$/);

  const handleSaveKeywords = () => {
    setKeywordFormatError(undefined);
    setShowEditKeywordsMode(false);
    if (updatedKeywords.length <= 3) {
      if (
        updatedKeywords
          .map((keyword) => isValidKeyword(keyword) && validKeywordLetters.test(keyword))
          .every(Boolean)
      ) {
        updateSeriesKeywords(series!.id, updatedKeywords, isAdmin)
          .then(() => mutateSeries())
          .catch((error) => {
            setGlobalError(error.status, error.message);
          });
        setShowEditKeywordsMode(false);
      } else
        setKeywordFormatError("Blir ikke lagret, nøkkelord kan bare inneholde norske bokstaver, tall og underscore");
    } else setKeywordFormatError("Du kan maksimalt velge 3 nøkkelord");
  };

  return (
    <>
      <VStack gap="2">
        <Heading level="2" size="xsmall">
          Nøkkelord
        </Heading>
        <BodyShort>
          Nøkkelord vil bli brukt til søket, så her kan dere legge ord som dere mener bør gi treff på dette
          hjelpemiddelet.
        </BodyShort>
        {!showEditKeywordsMode && (
          <>
            {!keywords ? (
              <>
                {isEditable ? (
                  <Button
                    className="fit-content"
                    variant="tertiary"
                    icon={<PlusCircleIcon title="Legg til URL til produsentens produktside" fontSize="1.5rem" />}
                    onClick={() => setShowEditKeywordsMode(true)}
                  >
                    Legg til nøkkelord
                  </Button>
                ) : (
                  "-"
                )}
              </>
            ) : (
              <>
                <HStack gap="4">
                  {updatedKeywords.map((keyword, index) => (
                    <span className="keywords-static" key={index}>
                      <Tag variant="alt3">{keyword}</Tag>
                      {index < updatedKeywords.length - 1 ? "  " : ""}
                    </span>
                  ))}
                </HStack>
                {isEditable && (
                  <Button
                    className="fit-content"
                    variant="tertiary"
                    icon={<PencilWritingIcon title="Endre url" fontSize="1.5rem" />}
                    onClick={() => setShowEditKeywordsMode(true)}
                  >
                    Endre nøkkelord
                  </Button>
                )}
              </>
            )}
          </>
        )}

        {showEditKeywordsMode && (
          <>
            <UNSAFE_Combobox
              className="keyword-box"
              id="keywords"
              label="Legg til nøkkelord"
              allowNewValues={true}
              isMultiSelect={true}
              clearButton={true}
              options={[]}
              selectedOptions={updatedKeywords || []}
              maxSelected={{ limit: 3 }}
              shouldShowSelectedOptions={true}
              shouldAutocomplete={true}
              onToggleSelected={(option: string, isSelected: boolean) =>
                isSelected && isValidKeyword(inputValue) && validKeywordLetters.test(inputValue)
                  ? setUpdatedKeywords([...updatedKeywords, option])
                  : setUpdatedKeywords(updatedKeywords.filter((o) => o !== option))
              }
              error={keywordFormatError}
            />
            <Button
              className="fit-content"
              variant="tertiary"
              icon={<FloppydiskIcon title="Lagre nøkkelord" fontSize="1.5rem" />}
              onClick={handleSaveKeywords}
            >
              Lagre
            </Button>
          </>
        )}
      </VStack>
    </>
  );
};

export default AboutTabKeywords;
