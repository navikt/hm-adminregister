import { Alert, Button, Heading, Tabs, Textarea, VStack } from "@navikt/ds-react";
import { useRef, useState } from "react";
import { SubmitHandler, useFormContext } from "react-hook-form";
import { FloppydiskIcon, PencilWritingIcon, PlusCircleIcon } from "@navikt/aksel-icons";
import { EditCommonInfoProduct } from "./Produkt";
import { IsoCategoryDTO, ProductRegistrationDTO } from "utils/types/response-types";
import { labelRequired } from "utils/string-util";

interface Props {
  product: ProductRegistrationDTO;
  onSubmit: SubmitHandler<EditCommonInfoProduct>;
  isoCategory?: IsoCategoryDTO;
  showInputError: boolean;
}

const AboutTab = ({ product, onSubmit, isoCategory, showInputError }: Props) => {
  const formMethods = useFormContext<EditCommonInfoProduct>();
  const [showEditDescriptionMode, setShowEditDescriptionMode] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const getDescription = () => (
    <>
      Beskrivelsen vises på produktsiden og bør:
      <ul>
        <li>Være mellom 100 og 750 tegn</li>
        <li>Ikke inneholde tekniske data, for eksempel. “Totalvekt i str. 42x40”</li>
        <li>Ha en nøytral språkstil uten markedsføringsuttrykk</li>
      </ul>
    </>
  );

  const handleSaveDescription = () => {
    setShowEditDescriptionMode(false);
    formRef.current?.requestSubmit();
  };

  return (
    <Tabs.Panel value="about" className="tab-panel">
      <form method="POST" onSubmit={formMethods.handleSubmit(onSubmit)} ref={formRef} role="legg til produktinfo">
        <VStack gap="14">
          <VStack gap="2">
            <Heading level="2" size="small">
              Iso-kategori (kode)
            </Heading>

            <div>
              {isoCategory?.isoTitle} ({isoCategory?.isoCode})
            </div>
          </VStack>

          <VStack gap="2">
            <Heading level="2" size="small">
              {labelRequired("Produktbeskrivelse")}
            </Heading>

            {!showEditDescriptionMode && (
              <>
                {!product.productData.attributes.text ? (
                  <>
                    <Alert variant={showInputError ? "error" : "info"}>
                      Produktet trenger en beskrivelse før det kan sendes til godkjenning
                    </Alert>
                    <Button
                      className="fit-content"
                      variant="tertiary"
                      icon={<PlusCircleIcon title="Legg til beskrivelse" fontSize="1.5rem" />}
                      onClick={() => setShowEditDescriptionMode(true)}
                    >
                      Legg til beskrivelse
                    </Button>
                  </>
                ) : (
                  <>
                    <pre className="pre">{product.productData.attributes.text}</pre>
                    {product.draftStatus === "DRAFT" && (
                      <Button
                        className="fit-content"
                        variant="tertiary"
                        icon={<PencilWritingIcon title="Endre beskrivelse" fontSize="1.5rem" />}
                        onClick={() => setShowEditDescriptionMode(true)}
                      >
                        Endre beskrivelse
                      </Button>
                    )}
                  </>
                )}
              </>
            )}

            {showEditDescriptionMode && (
              <>
                <Textarea
                  defaultValue={product.productData.attributes.text ?? (product.productData.attributes.text || "")}
                  label={""}
                  description={getDescription()}
                  id="description"
                  name="description"
                  onChange={(event) => formMethods.setValue("description", event.currentTarget.value)}
                />
                <Button
                  className="fit-content"
                  variant="tertiary"
                  icon={<FloppydiskIcon title="Lagre beskrivelse" fontSize="1.5rem" />}
                  onClick={handleSaveDescription}
                >
                  Lagre
                </Button>
              </>
            )}
          </VStack>
        </VStack>
      </form>
    </Tabs.Panel>
  );
};

export default AboutTab;
