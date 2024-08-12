import { BodyShort, Button, Heading, HStack, Tag, UNSAFE_Combobox, VStack } from "@navikt/ds-react";
import { FloppydiskIcon, PencilWritingIcon, PlusCircleIcon } from "@navikt/aksel-icons";
import { useState } from "react";
import { isValidKeyword } from "products/seriesUtils";
import "./about-tab-keywords.scss";
import { SeriesRegistrationDTO } from "utils/types/response-types";
import { updateSeriesKeywords } from "api/SeriesApi";
import { useErrorStore } from "utils/store/useErrorStore";
import { KeywordInput } from "products/about/keyword-input/combobox";

interface Props {
  series: SeriesRegistrationDTO;
  isAdmin: boolean;
  mutateSeries: () => void;
  isEditable: boolean;
}

export const AboutTabKeywords = ({ series, isAdmin, mutateSeries, isEditable }: Props) => {
  const keywords = series.seriesData.attributes.keywords;
  const [showEditKeywordsMode, setShowEditKeywordsMode] = useState(false);
  const [keywordFormatError, setKeywordFormatError] = useState<string | undefined>(undefined);
  const [updatedKeywords, setUpdatedKeywords] = useState<string[]>(keywords ? keywords : []);

  const { setGlobalError } = useErrorStore();

  const validKeywordLetters = new RegExp(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9_\s]*$/);

  const handleSaveKeywords = () => {
    if (updatedKeywords.length <= 3 && updatedKeywords.every((keyword) => allowedCharacters(keyword))) {
      updateSeriesKeywords(series!.id, updatedKeywords, isAdmin)
        .then(() => mutateSeries())
        .catch((error) => {
          setGlobalError(error.status, error.message);
        });
      setShowEditKeywordsMode(false);
    }
  };

  const allowedCharacters = (keyword: string) => isValidKeyword(keyword) && validKeywordLetters.test(keyword);

  const validKeyword = (keyword: string) => {
    setKeywordFormatError(undefined);
    if (updatedKeywords.length >= 3) {
      setKeywordFormatError("Du kan maksimalt velge 3 nøkkelord");
      return false;
    }
    if (!allowedCharacters(keyword)) {
      setKeywordFormatError("Nøkkelord kan bare inneholde norske bokstaver, tall og underscore");
      return false;
    }
    return true;
  };

  return (
    <>
      <VStack gap="2">
        <Heading level="2" size="xsmall">
          Nøkkelord
        </Heading>
        <BodyShort>Stikkord som kan søkes på i søket til FinnHjelpemiddel</BodyShort>
        {!showEditKeywordsMode && (
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
              <>
                {!keywords || keywords.length === 0 ? (
                  <Button
                    className="fit-content"
                    variant="tertiary"
                    icon={<PlusCircleIcon fontSize="1.5rem" aria-hidden />}
                    onClick={() => setShowEditKeywordsMode(true)}
                  >
                    Legg til nøkkelord
                  </Button>
                ) : (
                  <Button
                    className="fit-content"
                    variant="tertiary"
                    icon={<PencilWritingIcon fontSize="1.5rem" aria-hidden />}
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
            <KeywordInput
              label={"Nøkkelord input"}
              hideLabel
              options={[]}
              selectedOptions={updatedKeywords}
              maxSelected={{ limit: 3 }}
              onToggleSelected={(option: string, isSelected: boolean) =>
                isSelected && validKeyword(option)
                  ? setUpdatedKeywords([...updatedKeywords, option])
                  : setUpdatedKeywords(updatedKeywords.filter((o) => o !== option))
              }
              error={keywordFormatError}
            />
            <Button
              className="fit-content"
              variant="tertiary"
              icon={<FloppydiskIcon fontSize="1.5rem" aria-hidden />}
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
