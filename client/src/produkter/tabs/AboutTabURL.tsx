import { Alert, Button, Heading, TextField, VStack } from "@navikt/ds-react";
import { labelRequired } from "utils/string-util";
import { FloppydiskIcon, PencilWritingIcon, PlusCircleIcon } from "@navikt/aksel-icons";
import parse from "html-react-parser";
import { RichTextEditor } from "produkter/RichTextEditor";
import React, { useRef, useState } from "react";
import { SubmitHandler, useFormContext } from "react-hook-form";
import { EditSeriesInfo } from "produkter/Produkt";
import { IsoCategoryDTO, SeriesRegistrationDTO } from "utils/types/response-types";
import { isValidUrl } from "produkter/seriesUtils";

interface Props {
  series: SeriesRegistrationDTO;
  onSubmit: SubmitHandler<EditSeriesInfo>;
  isEditable: boolean;
  showInputError: boolean;
}

export const AboutTabURL = ({ series, onSubmit, isEditable, showInputError }: Props) => {
  const formMethods = useFormContext<EditSeriesInfo>();
  const formRef = useRef<HTMLFormElement>(null);
  const [showEditUrlMode, setShowEditUrlMode] = useState(false);
  const [urlFormatError, setUrlFormatError] = useState<string | undefined>(undefined);

  const handleSaveUrl = () => {
    setUrlFormatError(undefined);
    setShowEditUrlMode(false);
    formRef.current?.requestSubmit();
  };

  return (
    <>
      <form method="POST" onSubmit={formMethods.handleSubmit(onSubmit)} ref={formRef}>
        <VStack gap="2">
          <Heading level="2" size="xsmall">
            {"URL til leverandørs produktside"}
          </Heading>
          {!showEditUrlMode && (
            <>
              {!series.seriesData.attributes.url ? (
                <>
                  {isEditable ? (
                    <Button
                      className="fit-content"
                      variant="tertiary"
                      icon={<PlusCircleIcon title="Legg til URL til leverandørs produktside" fontSize="1.5rem" />}
                      onClick={() => setShowEditUrlMode(true)}
                    >
                      Legg til URL til leverandørs produktside
                    </Button>
                  ) : (
                    "-"
                  )}
                </>
              ) : (
                <>
                  <a href={series.seriesData.attributes.url} target="_blank" className="preview" rel="noreferrer">
                    {series.seriesData.attributes.url}
                  </a>
                  {isEditable && (
                    <Button
                      className="fit-content"
                      variant="tertiary"
                      icon={<PencilWritingIcon title="Endre url" fontSize="1.5rem" />}
                      onClick={() => setShowEditUrlMode(true)}
                    >
                      Endre URL
                    </Button>
                  )}
                </>
              )}
            </>
          )}

          {showEditUrlMode && (
            <>
              <TextField
                defaultValue={series.seriesData.attributes.url || ""}
                label={""}
                id="url"
                name="url"
                type="text"
                onChange={(e) => {
                  if (e.target.value.length > 0 && !isValidUrl(e.target.value)) {
                    setUrlFormatError("Ugyldig URL-format");
                  } else {
                    formMethods.setValue("url", e.target.value);
                    setUrlFormatError(undefined);
                  }
                }}
                error={urlFormatError}
              />
              <Button
                className="fit-content"
                variant="tertiary"
                icon={<FloppydiskIcon title="Lagre URL" fontSize="1.5rem" />}
                onClick={handleSaveUrl}
              >
                Lagre
              </Button>
            </>
          )}
        </VStack>
      </form>
    </>
  );
};

export default AboutTabURL;
