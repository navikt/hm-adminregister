import { Alert, BodyShort, Button, Heading, HStack, Tag, UNSAFE_Combobox, VStack } from "@navikt/ds-react";
import { labelRequired } from "utils/string-util";
import { FloppydiskIcon, PencilWritingIcon, PlusCircleIcon } from "@navikt/aksel-icons";
import parse from "html-react-parser";
import { RichTextEditor } from "produkter/RichTextEditor";
import React, { useRef, useState } from "react";
import { SubmitHandler, useFormContext } from "react-hook-form";
import { EditSeriesInfo } from "produkter/Produkt";
import { IsoCategoryDTO, SeriesRegistrationDTO } from "utils/types/response-types";
import { isValidKeyword } from "produkter/seriesUtils";

interface Props {
  series: SeriesRegistrationDTO;
  onSubmit: SubmitHandler<EditSeriesInfo>;
  isEditable: boolean;
  showInputError: boolean;
}

export const AboutTabKeywords = ({ series, onSubmit, isEditable, showInputError }: Props) => {
  const formMethods = useFormContext<EditSeriesInfo>();
  const formRef = useRef<HTMLFormElement>(null);
  const [showEditKeywordsMode, setShowEditKeywordsMode] = useState(false);
  const [keywordFormatError, setKeywordFormatError] = useState<string | undefined>(undefined);
  const [inputValue, setInputValue] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    series.seriesData.attributes.keywords ? series.seriesData.attributes.keywords : []
  );

  const validKeywordLetters = new RegExp(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9_\s]*$/);

  const notValidKeywordLetters = new RegExp(/[`!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~\s]*/);

  const handleSaveKeywords = () => {
    setKeywordFormatError(undefined);
    setShowEditKeywordsMode(false);
    if (selectedOptions.length <= 3) {
      formMethods.setValue("keywords", selectedOptions);
      formRef.current?.requestSubmit();
    } else setKeywordFormatError("Du kan maksimalt velge 3 nøkkelord");
  };

  /*
  const handleSaveKeywords = () => {
    setKeywordFormatError(undefined);
    setShowEditKeywordsMode(false);
    if (selectedOptions.length == 0) setKeywordFormatError("Ingen nøkkelordå lagre?");
    else if (selectedOptions.length > 3) setKeywordFormatError("Maksimalt 3 nøkkelord velges!");
    else if(selectedOptions.length <= 3 && selectedOptions.map((keyword) => !isValidKeyword(keyword) || notValidKeywordLetters.test(keyword)).every(Boolean)) {
      setKeywordFormatError("Nøkkelord kan kun inneholde norske bokstaver, tall og underscore");
    }
    /!*      else if(selectedOptions.length <= 3 && selectedOptions.map((keyword) => isValidKeyword(keyword) && validKeywordLetters.test(keyword) || !notValidKeywordLetters.test(keyword)).every(Boolean))  {
              formMethods.setValue("keywords", selectedOptions)
              formRef.current?.requestSubmit();
          } *!/else setKeywordFormatError("Nøkkelord kan kun inneholde norske bokstaver, tall og underscore");
  };
*/

  return (
    <>
      {/*<form method="POST" onSubmit={formMethods.handleSubmit(onSubmit)} ref={formRef}>*/}
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
            {!series.seriesData.attributes.keywords ? (
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
                  {selectedOptions.map((keyword, index) => (
                    <>
                      <Tag variant="info-moderate" key={index}>
                        {keyword}
                      </Tag>
                      {index < selectedOptions.length - 1 ? "  " : ""}
                    </>
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
              id="keywords"
              label=""
              allowNewValues={true}
              isMultiSelect={true}
              clearButton={true}
              options={[]}
              selectedOptions={selectedOptions || []}
              maxSelected={{ limit: 3 }}
              shouldShowSelectedOptions={true}
              shouldAutocomplete={true}
              onToggleSelected={(option: string, isSelected: boolean) =>
                isSelected && isValidKeyword(inputValue) && validKeywordLetters.test(inputValue)
                  ? setSelectedOptions([...selectedOptions, option])
                  : setSelectedOptions(selectedOptions.filter((o) => o !== option))
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
      {/*</form>*/}
    </>
  );
};

export default AboutTabKeywords;
